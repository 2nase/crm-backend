import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './infra/prisma/prisma.module';
import { EventsModule } from './modules/events/events.module';
import { AgentsModule } from './modules/agents/agents.module';
import { AutomationModule } from './modules/automation/automation.module';
import { AiModule } from './modules/ai/ai.module';

import { ContactsModule } from './modules/contacts/contacts.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CallsModule } from './modules/calls/calls.module';
import { EmailsModule } from './modules/emails/emails.module';
import { EmailTemplatesModule } from './modules/email-templates/email-templates.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 50,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EventsModule,
    AgentsModule,
    AiModule,
    ActivityLogsModule,
    ContactsModule,
    DealsModule,
    TasksModule,
    CallsModule,
    EmailsModule,
    EmailTemplatesModule,
    AutomationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
