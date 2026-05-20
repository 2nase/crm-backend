import { Injectable } from '@nestjs/common';
import { ActivityLog, ActivityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface LogActivityInput {
  type: ActivityType;
  message: string;
  contactId?: string | null;
  metadata?: Prisma.JsonValue;
}

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  log(input: LogActivityInput): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        type: input.type,
        message: input.message,
        contactId: input.contactId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  findAll(filters: { contactId?: string; type?: ActivityType; limit?: number; offset?: number }): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: {
        ...(filters.contactId ? { contactId: filters.contactId } : {}),
        ...(filters.type ? { type: filters.type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(filters.limit ?? 100, 500),
      ...(filters.offset ? { skip: filters.offset } : {}),
    });
  }
}
