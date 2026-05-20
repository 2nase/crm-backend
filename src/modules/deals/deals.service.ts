import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Deal, DealStage, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

interface StageHistoryEntry {
  from: DealStage | null;
  to: DealStage;
  at: string;
}

const CLOSED_STAGES: readonly DealStage[] = [DealStage.WON, DealStage.LOST];

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async create(dto: CreateDealDto): Promise<Deal> {
    // Verify contact exists
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new BadRequestException(`Contact ${dto.contactId} not found`);

    const initialStage: DealStage = dto.stage ?? DealStage.LEAD;
    const history: StageHistoryEntry[] = [
      { from: null, to: initialStage, at: new Date().toISOString() },
    ];
    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        contactId: dto.contactId,
        value: dto.value ?? 0,
        stage: initialStage,
        probability: dto.probability ?? 50,
        stageHistory: history as unknown as Prisma.InputJsonValue,
        closedAt: CLOSED_STAGES.includes(initialStage) ? new Date() : null,
      },
    });
    await this.activity.log({
      type: ActivityType.DEAL_CREATED,
      message: `Deal created: ${deal.title}`,
      contactId: deal.contactId,
      metadata: { dealId: deal.id, stage: deal.stage },
    });
    this.bus.emit(DomainEvent.DEAL_UPDATED, {
      dealId: deal.id,
      contactId: deal.contactId,
      fromStage: null,
      toStage: deal.stage,
      stageChanged: true,
      occurredAt: new Date(),
    });
    return deal;
  }

  findAll(filters: { stage?: DealStage; contactId?: string }): Promise<Deal[]> {
    return this.prisma.deal.findMany({
      where: {
        ...(filters.stage ? { stage: filters.stage } : {}),
        ...(filters.contactId ? { contactId: filters.contactId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException(`Deal ${id} not found`);
    return deal;
  }

  async update(id: string, dto: UpdateDealDto): Promise<Deal> {
    const existing = await this.findOne(id);
    const stageChanged = dto.stage !== undefined && dto.stage !== existing.stage;
    const newStage: DealStage = stageChanged ? (dto.stage as DealStage) : existing.stage;

    let nextHistory = existing.stageHistory as unknown as StageHistoryEntry[];
    if (stageChanged) {
      nextHistory = [
        ...(Array.isArray(nextHistory) ? nextHistory : []),
        { from: existing.stage, to: newStage, at: new Date().toISOString() },
      ];
    }

    const data: Prisma.DealUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.value !== undefined ? { value: dto.value } : {}),
      ...(dto.probability !== undefined ? { probability: dto.probability } : {}),
      ...(stageChanged
        ? {
            stage: newStage,
            stageHistory: nextHistory as unknown as Prisma.InputJsonValue,
            closedAt: CLOSED_STAGES.includes(newStage) ? new Date() : null,
          }
        : {}),
    };

    const updated = await this.prisma.deal.update({ where: { id }, data });

    if (stageChanged) {
      await this.activity.log({
        type: ActivityType.DEAL_STAGE_CHANGED,
        message: `Deal ${updated.title}: ${existing.stage} → ${newStage}`,
        contactId: updated.contactId,
        metadata: { dealId: id, from: existing.stage, to: newStage },
      });
    } else {
      await this.activity.log({
        type: ActivityType.DEAL_UPDATED,
        message: `Deal updated: ${updated.title}`,
        contactId: updated.contactId,
        metadata: { dealId: id },
      });
    }

    this.bus.emit(DomainEvent.DEAL_UPDATED, {
      dealId: updated.id,
      contactId: updated.contactId,
      fromStage: existing.stage,
      toStage: updated.stage,
      stageChanged,
      occurredAt: new Date(),
    });

    return updated;
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const existing = await this.findOne(id);
    await this.prisma.deal.delete({ where: { id } });
    await this.activity.log({
      type: ActivityType.DEAL_UPDATED,
      message: `Deal deleted: ${existing.title}`,
      contactId: existing.contactId,
      metadata: { dealId: id, deleted: true },
    });
    return { id, deleted: true };
  }
}
