import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../events/event-bus.service';
import {
  AnyEventPayload,
  DomainEvent,
  EventPayloadMap,
} from '../events/domain-events';
import { AgentMetadata, BaseAgent } from './base-agent.interface';

@Injectable()
export class AgentRegistry {
  private readonly logger = new Logger(AgentRegistry.name);
  private readonly agents: BaseAgent[] = [];

  constructor(private readonly bus: EventBusService) {}

  register(agent: BaseAgent): void {
    if (this.agents.find((a) => a.name === agent.name)) {
      this.logger.warn(`Agent ${agent.name} already registered — skipping`);
      return;
    }
    this.agents.push(agent);
    for (const evt of agent.triggerEvents) {
      this.bus.on(evt, async (payload: EventPayloadMap[typeof evt]) => {
        await this.invokeAgent(agent, evt, payload as AnyEventPayload);
      });
    }
    this.logger.log(
      `Registered agent ${agent.name} → [${agent.triggerEvents.join(', ')}]`,
    );
  }

  private async invokeAgent(
    agent: BaseAgent,
    evt: DomainEvent,
    payload: AnyEventPayload,
  ): Promise<void> {
    try {
      await agent.execute(evt, payload);
    } catch (err) {
      this.logger.error(
        `Agent ${agent.name} failed on ${evt}: ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  list(): AgentMetadata[] {
    return this.agents.map((a) => ({ name: a.name, triggers: a.triggerEvents }));
  }
}
