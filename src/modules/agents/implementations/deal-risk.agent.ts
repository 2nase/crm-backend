import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class DealRiskAgent implements BaseAgent, OnModuleInit {
  readonly name = 'DealRiskAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.DEAL_UPDATED,
    DomainEvent.TASK_OVERDUE,
  ];

  private readonly logger = new Logger(DealRiskAgent.name);

  constructor(
    private readonly registry: AgentRegistry,
    private readonly ai: AiService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    const dealId = (payload as { dealId?: string | null }).dealId;
    if (!dealId) {
      this.logger.log(`triggered: ${event} — no dealId, skipping`);
      return;
    }
    const f = await this.ai.forecast(dealId);
    this.logger.log(
      `triggered: ${event} — deal ${dealId} forecast probability=${f.probability} (stub)`,
    );
  }
}
