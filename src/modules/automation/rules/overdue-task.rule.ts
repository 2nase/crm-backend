import { Injectable, Logger } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { TasksService } from '../../tasks/tasks.service';

@Injectable()
export class OverdueTaskRule {
  private readonly logger = new Logger(OverdueTaskRule.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TasksService,
  ) {}

  async run(): Promise<number> {
    const now = new Date();
    const due = await this.prisma.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
      },
      select: { id: true },
    });
    for (const t of due) {
      await this.tasks.markOverdue(t.id);
    }
    this.logger.log(`OverdueTaskRule fired for ${due.length} tasks`);
    return due.length;
  }
}
