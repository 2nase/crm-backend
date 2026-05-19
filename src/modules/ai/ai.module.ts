import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { SummarizationStub } from './stubs/summarization.stub';
import { SentimentStub } from './stubs/sentiment.stub';
import { LeadScoringStub } from './stubs/lead-scoring.stub';
import { ObjectionDetectionStub } from './stubs/objection-detection.stub';
import { ForecastingStub } from './stubs/forecasting.stub';

@Module({
  providers: [
    AiService,
    SummarizationStub,
    SentimentStub,
    LeadScoringStub,
    ObjectionDetectionStub,
    ForecastingStub,
  ],
  exports: [AiService],
})
export class AiModule {}
