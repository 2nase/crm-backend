import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import {
  ALL_DOMAIN_EVENTS,
  AnyEventPayload,
  DomainEvent,
} from '../../events/domain-events';

@Injectable()
export class LearningLoopAgent implements BaseAgent, OnModuleInit {
  readonly name = 'LearningLoopAgent';
  readonly triggerEvents: readonly DomainEvent[] = ALL_DOMAIN_EVENTS;

  private readonly logger = new Logger(LearningLoopAgent.name);

  constructor(private readonly registry: AgentRegistry) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    this.logger.log(`observed: ${event} — would feed learning loop (stub)`);
    void payload;
  }
}
