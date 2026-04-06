import { Lead, ConversationStage } from '@prisma/client';
import { leadService } from '../lead/lead.service';
import { messageService } from '../whatsapp/message.service';
import { askClaude } from './claude.client';
import { ANA_SYSTEM_PROMPT, buildContextPrompt } from './prompts/ana-system';
import { stageTransitions } from './conversation.state';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';

export class ChatbotService {
  async handleIncomingMessage(phone: string, text: string, externalId?: string): Promise<void> {
    const lead = await leadService.findOrCreate(phone);
    const conversation = await leadService.getOrCreateConversation(lead.id);

    // Salvar mensagem recebida
    await messageService.saveInbound(conversation.id, text, externalId);

    // Atualizar timestamp
    await prisma.lead.update({
      where: { id: lead.id },
      data: { lastMessageAt: new Date() },
    });

    // Processar transicao de estado
    const currentStage = lead.currentStage;
    const transitionFn = stageTransitions[currentStage];

    if (!transitionFn) {
      logger.warn({ stage: currentStage, leadId: lead.id }, 'Sem transicao para este stage');
      return;
    }

    const transition = transitionFn(text);

    // Validacao
    if (transition.validate) {
      const error = transition.validate(text);
      if (error) {
        await messageService.sendAndSave(conversation.id, phone, error);
        return;
      }
    }

    // Extrair dados do lead
    if (transition.extractData) {
      const data = transition.extractData(text);
      if (data) {
        await leadService.updateLeadData(lead.id, data);
      }
    }

    // Atualizar stage
    await leadService.updateStage(lead.id, transition.nextStage, transition.status);

    // Buscar lead atualizado para contexto
    const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } });
    if (!updatedLead) return;

    // Gerar resposta com Claude
    const response = await this.generateResponse(updatedLead, conversation.id, text);

    // Enviar resposta
    await messageService.sendAndSave(conversation.id, phone, response.text);

    // Se chegou no stage SUBMISSION, disparar envio para parceiro
    if (transition.nextStage === ConversationStage.SUBMISSION) {
      await this.triggerPartnerSubmission(lead.id);
    }

    logger.info({
      leadId: lead.id,
      stage: transition.nextStage,
      tokensIn: response.tokensIn,
      tokensOut: response.tokensOut,
    }, 'Mensagem processada');
  }

  private async generateResponse(
    lead: Lead,
    conversationId: string,
    userMessage: string
  ): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    // Buscar ultimas mensagens para contexto
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const claudeMessages = recentMessages
      .reverse()
      .map(msg => ({
        role: (msg.direction === 'INBOUND' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));

    // Adicionar mensagem atual se nao esta no historico
    if (!claudeMessages.length || claudeMessages[claudeMessages.length - 1].content !== userMessage) {
      claudeMessages.push({ role: 'user', content: userMessage });
    }

    const contextPrompt = buildContextPrompt(lead.currentStage, {
      name: lead.name,
      fgtsBalance: lead.fgtsBalance?.toString(),
      isClt: lead.isClt,
      hasSaqueAniv: lead.hasSaqueAniv,
      cpf: lead.cpf,
      birthDate: lead.birthDate,
      pixKey: lead.pixKey,
    });

    const systemPrompt = ANA_SYSTEM_PROMPT + '\n\n' + contextPrompt;

    // Usar Haiku para stages simples, Sonnet para complexos
    const simpleStages = [
      ConversationStage.WELCOME,
      ConversationStage.WAITING_RESULT,
      ConversationStage.FOLLOW_UP,
    ];
    const model = simpleStages.includes(lead.currentStage)
      ? 'claude-haiku-4-5-20251001'
      : 'claude-sonnet-4-20250514';

    return askClaude(systemPrompt, claudeMessages, { model });
  }

  private async triggerPartnerSubmission(leadId: string): Promise<void> {
    // Importacao dinamica para evitar dependencia circular
    const { partnerService } = await import('../partner/partner.service');
    partnerService.submitToPartners(leadId).catch(error => {
      logger.error({ leadId, error: error.message }, 'Erro ao submeter para parceiro');
    });
  }
}

export const chatbotService = new ChatbotService();
