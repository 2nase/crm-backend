import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { AutomationService } from './automation.service';
import { InactivityRule } from './rules/inactivity.rule';
import { OverdueTaskRule } from './rules/overdue-task.rule';

@Module({
  imports: [TasksModule],
  providers: [AutomationService, InactivityRule, OverdueTaskRule],
  exports: [AutomationService, InactivityRule, OverdueTaskRule],
})
export class AutomationModule {}
