import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';

@Injectable()
export class CRMHygieneAgent implements BaseAgent, OnModuleInit {
  readonly name = 'CRMHygieneAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CONTACT_INACTIVE_14_DAYS,
  ];

  private readonly logger = new Logger(CRMHygieneAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`triggered: ${event} — would flag stale records for review (stub)`);
    void payload;
  }
}
