import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import {
  AnyEventPayload,
  CallFinishedPayload,
  DomainEvent,
} from '../../events/domain-events';
import { AiService } from '../../ai/ai.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class CallSummaryAgent implements BaseAgent, OnModuleInit {
  readonly name = 'CallSummaryAgent';
  readonly triggerEvents: readonly DomainEvent[] = [DomainEvent.CALL_FINISHED];

  private readonly logger = new Logger(CallSummaryAgent.name);

  constructor(
    private readonly registry: AgentRegistry,
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    const p = payload as CallFinishedPayload;
    if (!p.hasTranscript) {
      this.logger.log(`triggered: ${event} — call ${p.callId} has no transcript, skipping`);
      return;
    }
    const call = await this.prisma.call.findUnique({ where: { id: p.callId } });
    if (!call?.transcript) return;
    const summary = await this.ai.summarize(call.transcript);
    const sentiment = await this.ai.sentiment(call.transcript);
    const objections = await this.ai.detectObjections(call.transcript);
    await this.prisma.call.update({
      where: { id: p.callId },
      data: { summary, sentimentScore: sentiment, objections },
    });
    this.logger.log(`triggered: ${event} — enriched call ${p.callId} (stub AI)`);
  }
}
