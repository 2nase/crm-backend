import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AnthropicService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AnthropicService.name);

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async complete(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      this.logger.warn('ANTHROPIC_API_KEY not set — returning stub response');
      return '[AI not configured]';
    }
    try {
      const msg = await this.client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const block = msg.content[0];
      return block.type === 'text' ? block.text.trim() : '';
    } catch (e) {
      this.logger.error('Anthropic API error: ' + String(e));
      return '[AI error]';
    }
  }
}
