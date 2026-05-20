import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { AgentRegistry } from '../agent-registry.service';
import { BaseAgent } from '../base-agent.interface';
import { AnyEventPayload, DomainEvent } from '../../events/domain-events';
import { AnthropicService } from '../../ai/anthropic.service';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { PrismaService } from '../../../infra/prisma/prisma.service';

@Injectable()
export class NextBestActionAgent implements BaseAgent, OnModuleInit {
  readonly name = 'NextBestActionAgent';
  readonly triggerEvents: readonly DomainEvent[] = [
    DomainEvent.CONTACT_CREATED,
    DomainEvent.DEAL_UPDATED,
    DomainEvent.CALL_FINISHED,
  ];

  private readonly logger = new Logger(NextBestActionAgent.name);

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

    const deals = await this.prisma.deal.findMany({ where: { contactId }, orderBy: { updatedAt: 'desc' }, take: 3 });
    const openTasks = await this.prisma.task.findMany({ where: { contactId, status: 'OPEN' }, take: 5 });

    const dealInfo = deals.map(d => `${d.title} (${d.stage}, ${d.value}€)`).join(', ') || 'Kein Deal';
    const taskInfo = openTasks.map(t => t.title).join(', ') || 'Keine';

    const insight = await this.anthropic.complete(
      'Du bist ein Sales-Coach für ein deutsches Vertriebsunternehmen. Antworte auf Deutsch. Sei konkret und handlungsorientiert.',
      `Was ist die beste nächste Aktion für diesen Kontakt? (max 2 Sätze, sehr konkret)

Kontakt: ${contact.name} | Firma: ${contact.company || '—'} | Status: ${contact.status}
Auslöser: ${event}
Aktuelle Deals: ${dealInfo}
Offene Aufgaben: ${taskInfo}

Format: Nächste Aktion: ...`,
    );

    await this.activity.log({
      type: ActivityType.AGENT_TRIGGERED,
      message: insight,
      contactId,
      metadata: { agentName: this.name, event, raw: insight },
    });

    this.logger.log(`NextBestAction for ${contact.name}: done`);
  }
}
