import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Call, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async create(dto: CreateCallDto): Promise<Call> {
    // Verify contact exists
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new BadRequestException(`Contact ${dto.contactId} not found`);

    const call = await this.prisma.call.create({
      data: {
        contactId: dto.contactId,
        duration: dto.duration,
        timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
        transcript: dto.transcript,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    await this.prisma.contact.update({
      where: { id: call.contactId },
      data: { lastInteraction: call.timestamp },
    });
    await this.activity.log({
      type: ActivityType.CALL_LOGGED,
      message: `Call logged (${call.duration}s)`,
      contactId: call.contactId,
      metadata: { callId: call.id, duration: call.duration },
    });
    this.bus.emit(DomainEvent.CALL_FINISHED, {
      callId: call.id,
      contactId: call.contactId,
      duration: call.duration,
      hasTranscript: !!call.transcript,
      occurredAt: new Date(),
    });
    return call;
  }

  findAll(filters: { contactId?: string; q?: string }): Promise<Call[]> {
    return this.prisma.call.findMany({
      where: {
        ...(filters.contactId ? { contactId: filters.contactId } : {}),
        ...(filters.q
          ? {
              OR: [
                { transcript: { contains: filters.q, mode: 'insensitive' } },
                { summary: { contains: filters.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string): Promise<Call> {
    const call = await this.prisma.call.findUnique({ where: { id } });
    if (!call) throw new NotFoundException(`Call ${id} not found`);
    return call;
  }

  async update(id: string, dto: UpdateCallDto): Promise<Call> {
    await this.findOne(id);
    const data: Prisma.CallUpdateInput = {
      ...(dto.duration !== undefined ? { duration: dto.duration } : {}),
      ...(dto.timestamp !== undefined ? { timestamp: new Date(dto.timestamp) } : {}),
      ...(dto.transcript !== undefined ? { transcript: dto.transcript } : {}),
      ...(dto.metadata !== undefined
        ? { metadata: dto.metadata as Prisma.InputJsonValue }
        : {}),
    };
    return this.prisma.call.update({ where: { id }, data });
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.prisma.call.delete({ where: { id } });
    return { id, deleted: true };
  }
}
