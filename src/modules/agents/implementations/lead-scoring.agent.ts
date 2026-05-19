import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class LeadScoringAgent implements BaseAgent, OnModuleInit {
  readonly name = 'LeadScoringAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CONTACT_CREATED,
    DomainEvent.DEAL_UPDATED,
    DomainEvent.CALL_FINISHED,
  ];

  private readonly logger = new Logger(LeadScoringAgent.name);

  constructor(
    private readonly registry: AgentRegistry,
    private readonly ai: AiService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    const contactId = (payload as { contactId?: string }).contactId;
    if (!contactId) {
      this.logger.log(`triggered: ${event} — no contactId in payload`);
      return;
    }
    const score = await this.ai.scoreLead(contactId);
    this.logger.log(`triggered: ${event} — contact ${contactId} lead score = ${score} (stub)`);
  }
}
