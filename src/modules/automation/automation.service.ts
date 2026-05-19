import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InactivityRule } from './rules/inactivity.rule';
import { OverdueTaskRule } from './rules/overdue-task.rule';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly inactivity: InactivityRule,
    private readonly overdueTask: OverdueTaskRule,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'inactivity-rule' })
  async runInactivity(): Promise<void> {
    try {
      await this.inactivity.run();
    } catch (err) {
      this.logger.error('InactivityRule failed', (err as Error).stack);
    }
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'overdue-task-rule' })
  async runOverdue(): Promise<void> {
    try {
      await this.overdueTask.run();
    } catch (err) {
      this.logger.error('OverdueTaskRule failed', (err as Error).stack);
    }
  }
}
