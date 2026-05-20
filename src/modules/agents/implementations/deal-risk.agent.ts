import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AnthropicService } from '../../ai/anthropic.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

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
    private readonly anthropic: AnthropicService,
    private readonly activity: ActivityLogsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async execute(event: DomainEvent, payload: AnyEventPayload): Promise<void> {
    const dealId = (payload as { dealId?: string | null }).dealId;
    if (!dealId) return;

    const deal = await this.prisma.deal.findUnique({ where: { id: dealId }, include: { contact: true, tasks: true } });
    if (!deal) return;

    if (['WON', 'LOST'].includes(deal.stage)) return;

    const overdueTasks = deal.tasks.filter(t => t.status === 'OVERDUE').length;
    const daysSinceUpdate = Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / 86400000);

    const insight = await this.anthropic.complete(
      'Du bist ein Risiko-Analyst für Vertriebsprozesse. Antworte auf Deutsch. Direkt und handlungsorientiert.',
      `Bewerte das Risiko dieses Deals und gib eine konkrete Empfehlung (max 2 Sätze):

Deal: "${deal.title}" | Wert: ${deal.value}€ | Phase: ${deal.stage}
Kontakt: ${deal.contact.name}
Letzte Änderung: vor ${daysSinceUpdate} Tagen
Überfällige Aufgaben: ${overdueTasks}
Auslöser: ${event}

Format: Risiko: [NIEDRIG/MITTEL/HOCH] | Empfehlung: ...`,
    );

    const riskMatch = insight.match(/NIEDRIG|MITTEL|HOCH/i);
    const riskLevel = riskMatch ? riskMatch[0].toUpperCase() : 'MITTEL';

    await this.activity.log({
      type: ActivityType.AGENT_TRIGGERED,
      message: insight,
      contactId: deal.contactId,
      metadata: { agentName: this.name, dealId, dealTitle: deal.title, riskLevel, event, raw: insight },
    });

    this.logger.log(`DealRisk for "${deal.title}": ${riskLevel}`);
  }
}
