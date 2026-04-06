import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { leadService } from '../modules/lead/lead.service';
import { messageService } from '../modules/whatsapp/message.service';
import { prisma } from '../config/database';

const connection = redis;

// Fila de reengajamento
export const reengagementQueue = new Queue('reengagement', { connection });

// Fila de checagem de status dos parceiros
export const partnerStatusQueue = new Queue('partner-status', { connection });

// Worker de reengajamento
export function startReengagementWorker() {
  const worker = new Worker('reengagement', async (job) => {
    const { leadId, attempt } = job.data;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;

    // Se ja respondeu ou foi inativado, ignorar
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min
    if (lead.lastMessageAt && lead.lastMessageAt > cutoff) return;
    if (lead.status === 'INACTIVE' || lead.status === 'PAID' || lead.status === 'CANCELLED') return;

    const conversation = await leadService.getOrCreateConversation(lead.id);
    const firstName = lead.name?.split(' ')[0] || '';

    const messages = [
      `Oi${firstName ? ' ' + firstName : ''}! Vi que ficou alguma duvida. Posso te ajudar? 😊`,
      `${firstName ? firstName + ', s' : 'S'}ua simulacao ainda esta disponivel! Quer continuar de onde paramos?`,
      `Ultima chamada${firstName ? ', ' + firstName : ''}! Sua condicao especial expira em breve. Me chama se precisar!`,
    ];

    const msgIndex = Math.min(attempt - 1, messages.length - 1);

    if (attempt >= 3) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'INACTIVE' },
      });
      logger.info({ leadId }, 'Lead marcado como inativo');
      return;
    }

    await messageService.sendAndSave(conversation.id, lead.phone, messages[msgIndex]);
    logger.info({ leadId, attempt }, 'Reengajamento enviado');
  }, { connection });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, 'Job de reengajamento falhou');
  });

  return worker;
}

// Worker de status dos parceiros
export function startPartnerStatusWorker() {
  const worker = new Worker('partner-status', async (job) => {
    const { submissionId } = job.data;

    const submission = await prisma.partnerSubmission.findUnique({
      where: { id: submissionId },
      include: { lead: true },
    });

    if (!submission || submission.status !== 'SUBMITTED') return;

    // TODO: Chamar API do parceiro para checar status
    // Por enquanto, loga
    logger.info({ submissionId, partner: submission.partner }, 'Checando status do parceiro');
  }, { connection });

  return worker;
}

// Agendar reengajamentos
export async function scheduleReengagements() {
  const leads = await leadService.getInactiveLeads(2); // 2 horas sem resposta

  for (const lead of leads) {
    // Contar tentativas anteriores
    const existingJobs = await reengagementQueue.getJobs(['completed']);
    const attempts = existingJobs.filter(j => j.data.leadId === lead.id).length;

    await reengagementQueue.add('reengagement', {
      leadId: lead.id,
      attempt: attempts + 1,
    }, {
      delay: 0,
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}
