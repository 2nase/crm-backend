import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';

@Injectable()
export class StrategyAdvisorAgent implements BaseAgent, OnModuleInit {
  readonly name = 'StrategyAdvisorAgent';
  readonly triggerEvents: readonly DomainEvent[] = [DomainEvent.DEAL_UPDATED];

  private readonly logger = new Logger(StrategyAdvisorAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`triggered: ${event} — would propose stage-appropriate strategy (stub)`);
    void payload;
  }
}
