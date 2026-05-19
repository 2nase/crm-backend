import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';

@Injectable()
export class MailAssistantAgent implements BaseAgent, OnModuleInit {
  readonly name = 'MailAssistantAgent';
  readonly triggerEvents: readonly DomainEvent[] = [DomainEvent.EMAIL_SENT];

  private readonly logger = new Logger(MailAssistantAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`triggered: ${event} — would draft a tailored follow-up reply (stub)`);
    void payload;
  }
}
