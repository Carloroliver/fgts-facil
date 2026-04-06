import { prisma } from '../../config/database';
import { ConversationStage, LeadStatus } from '@prisma/client';
import { logger } from '../../utils/logger';

export class LeadService {
  async findOrCreate(phone: string) {
    let lead = await prisma.lead.findUnique({ where: { phone } });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          phone,
          status: LeadStatus.NEW,
          currentStage: ConversationStage.WELCOME,
        },
      });

      await prisma.leadEvent.create({
        data: {
          leadId: lead.id,
          type: 'lead.created',
          data: { phone },
        },
      });

      logger.info({ leadId: lead.id, phone }, 'Novo lead criado');
    }

    return lead;
  }

  async getOrCreateConversation(leadId: string) {
    let conversation = await prisma.conversation.findFirst({
      where: { leadId, isActive: true },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { leadId },
        include: { messages: true },
      });
    }

    return conversation;
  }

  async updateStage(leadId: string, stage: ConversationStage, status?: LeadStatus) {
    const data: any = { currentStage: stage, lastMessageAt: new Date() };
    if (status) data.status = status;

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data,
    });

    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'stage.changed',
        data: { stage, status: status || lead.status },
      },
    });

    return lead;
  }

  async updateLeadData(leadId: string, data: Record<string, any>) {
    return prisma.lead.update({
      where: { id: leadId },
      data: { ...data, lastMessageAt: new Date() },
    });
  }

  async getLeadWithConversation(leadId: string) {
    return prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        conversations: {
          where: { isActive: true },
          include: {
            messages: { orderBy: { createdAt: 'asc' }, take: 50 },
          },
        },
        submissions: true,
      },
    });
  }

  async getInactiveLeads(hoursInactive: number) {
    const cutoff = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);
    return prisma.lead.findMany({
      where: {
        lastMessageAt: { lt: cutoff },
        status: {
          notIn: [
            LeadStatus.PAID,
            LeadStatus.CANCELLED,
            LeadStatus.INACTIVE,
            LeadStatus.REJECTED,
          ],
        },
      },
    });
  }
}

export const leadService = new LeadService();
