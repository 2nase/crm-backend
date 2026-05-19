import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';

@Injectable()
export class NextBestActionAgent implements BaseAgent, OnModuleInit {
  readonly name = 'NextBestActionAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CONTACT_CREATED,
    DomainEvent.DEAL_UPDATED,
    DomainEvent.CALL_FINISHED,
  ];

  private readonly logger = new Logger(NextBestActionAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`triggered: ${event} — would compute the next best action (stub)`);
    void payload;
  }
}
