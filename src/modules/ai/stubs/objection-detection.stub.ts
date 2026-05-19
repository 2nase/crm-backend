import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectionDetectionStub {
  async detect(text: string): Promise<string[]> {
    void text;
    return [];
  }
}
