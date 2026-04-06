import { FastifyInstance } from 'fastify';
import { chatbotService } from '../chatbot/chatbot.service';
import { partnerService } from '../partner/partner.service';
import { normalizePhone } from '../../utils/phone';
import { logger } from '../../utils/logger';
import { Partner } from '@prisma/client';

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook da Evolution API - recebe mensagens do WhatsApp
  app.post('/api/webhook/evolution', async (request, reply) => {
    try {
      const body = request.body as any;
      const event = body.event;

      if (event === 'messages.upsert') {
        const message = body.data;

        // Ignorar mensagens enviadas por nos
        if (message.key?.fromMe) return reply.send({ ok: true });

        // Ignorar mensagens de grupo
        if (message.key?.remoteJid?.includes('@g.us')) return reply.send({ ok: true });

        const phone = normalizePhone(message.key?.remoteJid?.replace('@s.whatsapp.net', '') || '');
        const text = message.message?.conversation
          || message.message?.extendedTextMessage?.text
          || '';

        if (!phone || !text) return reply.send({ ok: true });

        logger.info({ phone, text: text.substring(0, 50) }, 'Mensagem recebida');

        // Processar assincronamente para responder rapido ao webhook
        chatbotService.handleIncomingMessage(phone, text, message.key?.id).catch(error => {
          logger.error({ phone, error: error.message }, 'Erro ao processar mensagem');
        });
      }

      return reply.send({ ok: true });
    } catch (error: any) {
      logger.error({ error: error.message }, 'Erro no webhook Evolution');
      return reply.status(500).send({ error: 'Internal error' });
    }
  });

  // Webhook de status de mensagem (entregue, lido, etc.)
  app.post('/api/webhook/evolution/status', async (request, reply) => {
    // TODO: atualizar MessageDeliveryStatus
    return reply.send({ ok: true });
  });

  // Webhooks dos parceiros
  app.post('/api/webhook/credliber', async (request, reply) => {
    const body = request.body as any;
    await partnerService.handlePartnerCallback(
      Partner.CREDLIBER,
      body.externalId,
      {
        success: true,
        status: body.status,
        approvedAmount: body.approvedAmount,
        commission: body.commission,
      }
    );
    return reply.send({ ok: true });
  });

  app.post('/api/webhook/icred', async (request, reply) => {
    const body = request.body as any;
    await partnerService.handlePartnerCallback(
      Partner.ICRED,
      body.externalId,
      {
        success: true,
        status: body.status,
        approvedAmount: body.approvedAmount,
        commission: body.commission,
      }
    );
    return reply.send({ ok: true });
  });

  app.post('/api/webhook/credspot', async (request, reply) => {
    const body = request.body as any;
    await partnerService.handlePartnerCallback(
      Partner.CREDSPOT,
      body.externalId,
      {
        success: true,
        status: body.status,
        approvedAmount: body.approvedAmount,
        commission: body.commission,
      }
    );
    return reply.send({ ok: true });
  });
}
