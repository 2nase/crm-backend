import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AnthropicService } from '../../ai/anthropic.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class LeadScoringAgent implements BaseAgent, OnModuleInit {
  readonly name = 'LeadScoringAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CONTACT_CREATED,
    DomainEvent.DEAL_UPDATED,
    DomainEvent.CALL_FINISHED,
  ];

  private readonly logger = new Logger(LeadScoringAgent.name);

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
    const contactId = (payload as { contactId?: string }).contactId;
    if (!contactId) return;

    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return;

    const deals = await this.prisma.deal.findMany({ where: { contactId } });
    const tasks = await this.prisma.task.findMany({ where: { contactId } });

    const insight = await this.anthropic.complete(
      'Du bist ein Sales-AI für ein deutsches Vertriebsunternehmen. Antworte immer auf Deutsch. Sei präzise und direkt.',
      `Bewerte diesen Lead (0-100) und gib kurz die Begründung (max 2 Sätze).

Kontakt: ${contact.name} | Firma: ${contact.company || '—'} | Status: ${contact.status}
Tags: ${contact.tags || '—'} | Notizen: ${contact.notes || '—'}
Deals: ${deals.length} (Wert: ${deals.reduce((s, d) => s + Number(d.value), 0)} €)
Offene Aufgaben: ${tasks.filter(t => t.status === 'OPEN').length}

Format: Score: XX/100 | Begründung: ...`,
    );

    const scoreMatch = insight.match(/(\d+)\s*\/\s*100/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    await this.activity.log({
      type: ActivityType.AGENT_TRIGGERED,
      message: insight,
      contactId,
      metadata: { agentName: this.name, score, event, raw: insight },
    });

    this.logger.log(`${contact.name} → Lead Score ${score}/100`);
  }
}
