import { prisma } from '../../config/database';
import { evolutionClient } from './evolution.client';
import { MessageDirection } from '@prisma/client';

export class MessageService {
  async sendAndSave(
    conversationId: string,
    to: string,
    text: string,
    options?: { delayMs?: number }
  ): Promise<void> {
    await evolutionClient.sendWithTyping(to, text, options?.delayMs);

    await prisma.message.create({
      data: {
        conversationId,
        direction: MessageDirection.OUTBOUND,
        content: text,
      },
    });
  }

  async saveInbound(
    conversationId: string,
    content: string,
    externalId?: string
  ): Promise<void> {
    await prisma.message.create({
      data: {
        conversationId,
        direction: MessageDirection.INBOUND,
        content,
        externalId,
      },
    });
  }
}

export const messageService = new MessageService();
