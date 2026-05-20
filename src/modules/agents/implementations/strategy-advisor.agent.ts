import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AnthropicService } from '../../ai/anthropic.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class StrategyAdvisorAgent implements BaseAgent, OnModuleInit {
  readonly name = 'StrategyAdvisorAgent';
  readonly triggerEvents: readonly DomainEvent[] = [DomainEvent.DEAL_UPDATED];

  private readonly logger = new Logger(StrategyAdvisorAgent.name);

  constructor(
    private readonly registry: AgentRegistry,
    private readonly anthropic: AnthropicService,
    private readonly activity: ActivityLogsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    const dealId = (payload as { dealId?: string }).dealId;
    if (!dealId) return;

    const deal = await this.prisma.deal.findUnique({ where: { id: dealId }, include: { contact: true } });
    if (!deal) return;

    const stageLabels: Record<string, string> = {
      LEAD: 'Kaltakquise', QUALIFIED: 'Erstgespräch', PROPOSAL: 'Angebot gesendet',
      NEGOTIATION: 'Verhandlung', WON: 'Gewonnen', LOST: 'Verloren',
    };
    const stageLabel = stageLabels[deal.stage] || deal.stage;
    const daysSinceCreated = Math.floor((Date.now() - new Date(deal.createdAt).getTime()) / 86400000);

    const insight = await this.anthropic.complete(
      'Du bist ein erfahrener Vertriebsstratege. Antworte auf Deutsch. Kurz, konkret, direkt.',
      `Gib eine kurze Strategie-Empfehlung für diesen Deal (max 2 Sätze):

Deal: "${deal.title}" | Wert: ${deal.value}€ | Phase: ${stageLabel}
Kontakt: ${deal.contact.name} (${deal.contact.company || '—'})
Alter: ${daysSinceCreated} Tage in der Pipeline

Format: Strategie: ...`,
    );

    await this.activity.log({
      type: ActivityType.AGENT_TRIGGERED,
      message: insight,
      contactId: deal.contactId,
      metadata: { agentName: this.name, dealId, dealTitle: deal.title, stage: deal.stage, event, raw: insight },
    });

    this.logger.log(`StrategyAdvisor for deal "${deal.title}": done`);
  }
}
