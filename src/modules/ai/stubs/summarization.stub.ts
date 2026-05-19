import { Injectable } from '@nestjs/common';

@Injectable()
export class SummarizationStub {
  async summarize(text: string): Promise<string> {
    const len = text.length;
    return `[stub summary — ${len} chars in]`;
  }
}
