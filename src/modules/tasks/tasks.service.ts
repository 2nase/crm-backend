import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityType, Prisma, Task, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { DomainEvent } from '../events/domain-events';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bus: EventBusService,
    private readonly activity: ActivityLogsService,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    // Verify contact exists
    const contact = await this.prisma.contact.findUnique({ where: { id: dto.contactId } });
    if (!contact) throw new BadRequestException(`Contact ${dto.contactId} not found`);

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        contactId: dto.contactId,
        dealId: dto.dealId,
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.priority ? { priority: dto.priority } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
      },
    });
    await this.activity.log({
      type: ActivityType.TASK_CREATED,
      message: `Task created: ${task.title}`,
      contactId: task.contactId,
      metadata: { taskId: task.id, dealId: task.dealId },
    });
    this.bus.emit(DomainEvent.TASK_CREATED, {
      taskId: task.id,
      contactId: task.contactId,
      dealId: task.dealId,
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate,
      occurredAt: new Date(),
    });
    return task;
  }

  findAll(filters: {
    status?: TaskStatus;
    contactId?: string;
    dealId?: string;
  }): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.contactId ? { contactId: filters.contactId } : {}),
        ...(filters.dealId ? { dealId: filters.dealId } : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.findOne(id);

    const data: Prisma.TaskUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {}),
      ...(dto.dealId !== undefined
        ? { deal: dto.dealId ? { connect: { id: dto.dealId } } : { disconnect: true } }
        : {}),
    };

    const becameDone =
      dto.status === TaskStatus.DONE && existing.status !== TaskStatus.DONE;
    if (becameDone) data.completedAt = new Date();

    const updated = await this.prisma.task.update({ where: { id }, data });

    if (becameDone) {
      await this.activity.log({
        type: ActivityType.TASK_COMPLETED,
        message: `Task completed: ${updated.title}`,
        contactId: updated.contactId,
        metadata: { taskId: id },
      });
    }
    return updated;
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { id, deleted: true };
  }

  async markOverdue(id: string): Promise<Task> {
    const task = await this.findOne(id);
    if (task.status === TaskStatus.OVERDUE) return task;
    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.OVERDUE },
    });
    await this.activity.log({
      type: ActivityType.TASK_OVERDUE,
      message: `Task overdue: ${updated.title}`,
      contactId: updated.contactId,
      metadata: { taskId: id, dueDate: updated.dueDate?.toISOString() ?? null },
    });
    if (updated.dueDate) {
      this.bus.emit(DomainEvent.TASK_OVERDUE, {
        taskId: updated.id,
        contactId: updated.contactId,
        dealId: updated.dealId,
        dueDate: updated.dueDate,
        occurredAt: new Date(),
      });
    }
    return updated;
  }
}
