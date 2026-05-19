import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AgentRegistry } from './agent-registry.service';
import { AgentsController } from './agents.controller';
import { FollowUpAgent } from './implementations/follow-up.agent';
import { DailyTaskAgent } from './implementations/daily-task.agent';
import { LeadScoringAgent } from './implementations/lead-scoring.agent';
import { MailAssistantAgent } from './implementations/mail-assistant.agent';
import { CallSummaryAgent } from './implementations/call-summary.agent';
import { StrategyAdvisorAgent } from './implementations/strategy-advisor.agent';
import { DealRiskAgent } from './implementations/deal-risk.agent';
import { NextBestActionAgent } from './implementations/next-best-action.agent';
import { CRMHygieneAgent } from './implementations/crm-hygiene.agent';
import { LearningLoopAgent } from './implementations/learning-loop.agent';

@Module({
  imports: [AiModule],
  controllers: [AgentsController],
  providers: [
    AgentRegistry,
    FollowUpAgent,
    DailyTaskAgent,
    LeadScoringAgent,
    MailAssistantAgent,
    CallSummaryAgent,
    StrategyAdvisorAgent,
    DealRiskAgent,
    NextBestActionAgent,
    CRMHygieneAgent,
    LearningLoopAgent,
  ],
  exports: [AgentRegistry],
})
export class AgentsModule {}
