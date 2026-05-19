import { Injectable } from '@nestjs/common';

@Injectable()
export class SentimentStub {
  async analyze(text: string): Promise<number> {
    void text;
    return 0.0;
  }
}
