import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { prisma } from './config/database';
import { webhookRoutes } from './modules/webhook/webhook.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { evolutionClient } from './modules/whatsapp/evolution.client';
import { startReengagementWorker, startPartnerStatusWorker, scheduleReengagements } from './jobs/queue';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = Fastify({ logger: false });

  // CORS
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  }));

  // Status da instancia WhatsApp
  app.get('/api/whatsapp/status', async () => {
    const state = await evolutionClient.getInstanceStatus();
    return { instance: env.EVOLUTION_INSTANCE_NAME, state };
  });

  // QR Code para conectar WhatsApp
  app.get('/api/whatsapp/qrcode', async () => {
    const qr = await evolutionClient.getQrCode();
    return { qrcode: qr };
  });

  // Criar instancia WhatsApp
  app.post('/api/whatsapp/setup', async () => {
    const result = await evolutionClient.createInstance();
    return result;
  });

  // Rotas
  await app.register(webhookRoutes);
  await app.register(dashboardRoutes);

  // Iniciar workers
  startReengagementWorker();
  startPartnerStatusWorker();

  // Job periodico de reengajamento (a cada 30 min)
  setInterval(scheduleReengagements, 30 * 60 * 1000);

  // Conectar banco
  await prisma.$connect();
  logger.info('Banco de dados conectado');

  // Iniciar servidor
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info(`Servidor rodando na porta ${env.PORT}`);
  logger.info(`Health check: http://localhost:${env.PORT}/health`);

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Desligando...');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  logger.error({ error: error.message }, 'Erro fatal ao iniciar servidor');
  process.exit(1);
});
