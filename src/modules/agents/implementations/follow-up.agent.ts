import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';

@Injectable()
export class FollowUpAgent implements BaseAgent, OnModuleInit {
  readonly name = 'FollowUpAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CALL_FINISHED,
    DomainEvent.EMAIL_SENT,
  ];

  private readonly logger = new Logger(FollowUpAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`triggered: ${event} — will plan a follow-up task (stub)`);
    void payload;
  }
}
