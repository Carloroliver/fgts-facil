import { Partner, SubmissionStatus, ConversationStage, LeadStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { leadService } from '../lead/lead.service';
import { messageService } from '../whatsapp/message.service';
import { logger } from '../../utils/logger';

interface PartnerClient {
  submit(data: PartnerSubmitData): Promise<PartnerResult>;
  checkStatus(externalId: string): Promise<PartnerResult>;
}

interface PartnerSubmitData {
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  pixKey: string;
  fgtsBalance: number;
}

interface PartnerResult {
  success: boolean;
  externalId?: string;
  status: 'processing' | 'approved' | 'rejected' | 'error';
  approvedAmount?: number;
  interestRate?: number;
  commission?: number;
  message?: string;
}

// Placeholder clients - serao implementados com APIs reais
class CredliberClient implements PartnerClient {
  async submit(data: PartnerSubmitData): Promise<PartnerResult> {
    // TODO: Integrar com API real da Credliber
    logger.info({ cpf: data.cpf }, 'Credliber: submissao enviada');
    return {
      success: true,
      externalId: `credliber_${Date.now()}`,
      status: 'processing',
    };
  }

  async checkStatus(externalId: string): Promise<PartnerResult> {
    // TODO: Polling real
    return { success: true, status: 'processing' };
  }
}

class ICredClient implements PartnerClient {
  async submit(data: PartnerSubmitData): Promise<PartnerResult> {
    logger.info({ cpf: data.cpf }, 'iCred: submissao enviada');
    return {
      success: true,
      externalId: `icred_${Date.now()}`,
      status: 'processing',
    };
  }

  async checkStatus(externalId: string): Promise<PartnerResult> {
    return { success: true, status: 'processing' };
  }
}

class CredSpotClient implements PartnerClient {
  async submit(data: PartnerSubmitData): Promise<PartnerResult> {
    logger.info({ cpf: data.cpf }, 'CredSpot: submissao enviada');
    return {
      success: true,
      externalId: `credspot_${Date.now()}`,
      status: 'processing',
    };
  }

  async checkStatus(externalId: string): Promise<PartnerResult> {
    return { success: true, status: 'processing' };
  }
}

const partnerClients: Record<Partner, PartnerClient> = {
  [Partner.CREDLIBER]: new CredliberClient(),
  [Partner.ICRED]: new ICredClient(),
  [Partner.CREDSPOT]: new CredSpotClient(),
};

const partnerOrder: Partner[] = [Partner.CREDLIBER, Partner.ICRED, Partner.CREDSPOT];

export class PartnerService {
  async submitToPartners(leadId: string): Promise<void> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || !lead.name || !lead.cpf || !lead.birthDate || !lead.fgtsBalance) {
      logger.error({ leadId }, 'Dados incompletos para submissao');
      return;
    }

    const submitData: PartnerSubmitData = {
      name: lead.name,
      cpf: lead.cpf,
      birthDate: lead.birthDate,
      phone: lead.phone,
      pixKey: lead.pixKey || lead.phone,
      fgtsBalance: Number(lead.fgtsBalance),
    };

    for (const partner of partnerOrder) {
      try {
        const client = partnerClients[partner];
        const result = await client.submit(submitData);

        const submission = await prisma.partnerSubmission.create({
          data: {
            leadId,
            partner,
            externalId: result.externalId,
            status: result.success ? SubmissionStatus.SUBMITTED : SubmissionStatus.ERROR,
            requestPayload: submitData as any,
            responsePayload: result as any,
            approvedAmount: result.approvedAmount,
            interestRate: result.interestRate,
            commission: result.commission,
            attempts: 1,
            lastAttemptAt: new Date(),
          },
        });

        if (result.success) {
          await leadService.updateStage(leadId, ConversationStage.WAITING_RESULT, LeadStatus.ANALYZING);
          logger.info({ leadId, partner }, 'Submissao enviada com sucesso');
          return; // Sucesso - nao tenta proximo parceiro
        }
      } catch (error: any) {
        logger.error({ leadId, partner, error: error.message }, 'Erro na submissao');
        continue; // Tenta proximo parceiro
      }
    }

    // Todos falharam
    await leadService.updateStage(leadId, ConversationStage.RESULT_REJECTED, LeadStatus.REJECTED);
    const conversation = await leadService.getOrCreateConversation(leadId);
    await messageService.sendAndSave(
      conversation.id,
      lead.phone,
      'Poxa, infelizmente nao conseguimos aprovar sua antecipacao neste momento. Mas nao desanima! Posso te avisar quando tiver novas condicoes disponiveis. 😊'
    );
  }

  async handlePartnerCallback(
    partner: Partner,
    externalId: string,
    result: PartnerResult
  ): Promise<void> {
    const submission = await prisma.partnerSubmission.findFirst({
      where: { partner, externalId },
      include: { lead: true },
    });

    if (!submission) {
      logger.warn({ partner, externalId }, 'Submissao nao encontrada para callback');
      return;
    }

    const status = result.status === 'approved'
      ? SubmissionStatus.APPROVED
      : result.status === 'rejected'
        ? SubmissionStatus.REJECTED
        : SubmissionStatus.PROCESSING;

    await prisma.partnerSubmission.update({
      where: { id: submission.id },
      data: {
        status,
        approvedAmount: result.approvedAmount,
        interestRate: result.interestRate,
        commission: result.commission,
        responsePayload: result as any,
        resolvedAt: status !== SubmissionStatus.PROCESSING ? new Date() : undefined,
      },
    });

    const lead = submission.lead;
    const conversation = await leadService.getOrCreateConversation(lead.id);

    if (result.status === 'approved') {
      await leadService.updateStage(lead.id, ConversationStage.RESULT_APPROVED, LeadStatus.APPROVED);
      const amount = result.approvedAmount
        ? `R$ ${result.approvedAmount.toLocaleString('pt-BR')}`
        : 'o valor';
      await messageService.sendAndSave(
        conversation.id,
        lead.phone,
        `Otima noticia, ${lead.name?.split(' ')[0]}! 🎉 Sua antecipacao de ${amount} foi APROVADA! O PIX sera enviado para sua conta em breve. Qualquer duvida, estou aqui!`
      );
    } else if (result.status === 'rejected') {
      // Tentar proximo parceiro
      const nextPartnerIndex = partnerOrder.indexOf(partner) + 1;
      if (nextPartnerIndex < partnerOrder.length) {
        logger.info({ leadId: lead.id, nextPartner: partnerOrder[nextPartnerIndex] }, 'Tentando proximo parceiro');
        // Re-submeter para proximo parceiro (simplificado)
      } else {
        await leadService.updateStage(lead.id, ConversationStage.RESULT_REJECTED, LeadStatus.REJECTED);
        await messageService.sendAndSave(
          conversation.id,
          lead.phone,
          `${lead.name?.split(' ')[0]}, infelizmente nao conseguimos aprovar sua antecipacao neste momento. Posso te avisar quando houver novas condicoes! 😊`
        );
      }
    }
  }
}

export const partnerService = new PartnerService();
