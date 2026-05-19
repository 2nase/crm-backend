import { Injectable, Logger } from '@nestjs/common';
import { ActivityType, ContactStatus } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { DomainEvent } from '../../events/domain-events';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

const INACTIVITY_DAYS = 14;

@Injectable()
export class InactivityRule {
  private readonly logger = new Logger(InactivityRule.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async run(): Promise<number> {
    const threshold = new Date(Date.now() - INACTIVITY_DAYS * 86_400_000);
    const stale = await this.prisma.contact.findMany({
      where: {
        status: { notIn: [ContactStatus.CHURNED, ContactStatus.INACTIVE] },
        OR: [
          { lastInteraction: { lt: threshold } },
          { lastInteraction: null, createdAt: { lt: threshold } },
        ],
      },
      select: { id: true, lastInteraction: true, createdAt: true },
    });

    for (const c of stale) {
      const since = c.lastInteraction ?? c.createdAt;
      const days = Math.floor((Date.now() - since.getTime()) / 86_400_000);
      this.bus.emit(DomainEvent.CONTACT_INACTIVE_14_DAYS, {
        contactId: c.id,
        lastInteraction: c.lastInteraction,
        daysSinceInteraction: days,
        occurredAt: new Date(),
      });
      await this.activity.log({
        type: ActivityType.CONTACT_INACTIVE,
        message: `Contact inactive for ${days} days`,
        contactId: c.id,
        metadata: { daysSinceInteraction: days },
      });
    }
    this.logger.log(`InactivityRule fired for ${stale.length} contacts`);
    return stale.length;
  }
}
