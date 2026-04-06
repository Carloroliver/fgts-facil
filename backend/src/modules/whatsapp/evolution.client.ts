import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export class EvolutionClient {
  private api: AxiosInstance;
  private instance: string;

  constructor() {
    this.instance = env.EVOLUTION_INSTANCE_NAME;
    this.api = axios.create({
      baseURL: env.EVOLUTION_API_URL,
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
    });
  }

  async sendText(to: string, text: string): Promise<void> {
    try {
      await this.api.post(`/message/sendText/${this.instance}`, {
        number: to,
        text,
      });
      logger.info({ to }, 'Mensagem enviada');
    } catch (error: any) {
      logger.error({ to, error: error.message }, 'Erro ao enviar mensagem');
      throw error;
    }
  }

  async sendPresence(to: string, type: 'composing' | 'paused' = 'composing'): Promise<void> {
    try {
      await this.api.post(`/chat/updatePresence/${this.instance}`, {
        number: to,
        presence: type,
      });
    } catch (error: any) {
      logger.warn({ to, error: error.message }, 'Erro ao enviar presenca');
    }
  }

  async sendWithTyping(to: string, text: string, delayMs?: number): Promise<void> {
    const delay = delayMs || Math.min(1000 + text.length * 30, 4000);
    await this.sendPresence(to, 'composing');
    await new Promise(resolve => setTimeout(resolve, delay));
    await this.sendPresence(to, 'paused');
    await this.sendText(to, text);
  }

  async getInstanceStatus(): Promise<string> {
    try {
      const response = await this.api.get(`/instance/connectionState/${this.instance}`);
      return response.data?.instance?.state || 'unknown';
    } catch {
      return 'error';
    }
  }

  async createInstance(): Promise<any> {
    try {
      const response = await this.api.post('/instance/create', {
        instanceName: this.instance,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
        webhook: {
          url: `http://host.docker.internal:${env.PORT}/api/webhook/evolution`,
          byEvents: false,
          base64: false,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'CONNECTION_UPDATE',
          ],
        },
      });
      logger.info('Instancia Evolution criada');
      return response.data;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Erro ao criar instancia');
      throw error;
    }
  }

  async getQrCode(): Promise<string | null> {
    try {
      const response = await this.api.get(`/instance/connect/${this.instance}`);
      return response.data?.base64 || null;
    } catch {
      return null;
    }
  }
}

export const evolutionClient = new EvolutionClient();
