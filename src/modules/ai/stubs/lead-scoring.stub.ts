import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadScoringStub {
  async score(contactId: string): Promise<number> {
    void contactId;
    return 50;
  }
}
