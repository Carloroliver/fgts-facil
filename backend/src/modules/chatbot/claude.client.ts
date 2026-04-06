import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

interface ClaudeResponse {
  text: string;
  tokensIn: number;
  tokensOut: number;
}

export async function askClaude(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: { model?: string; maxTokens?: number }
): Promise<ClaudeResponse> {
  const model = options?.model || 'claude-sonnet-4-20250514';
  const maxTokens = options?.maxTokens || 300;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    return {
      text,
      tokensIn: response.usage.input_tokens,
      tokensOut: response.usage.output_tokens,
    };
  } catch (error: any) {
    logger.error({ error: error.message }, 'Erro na Claude API');
    throw error;
  }
}
