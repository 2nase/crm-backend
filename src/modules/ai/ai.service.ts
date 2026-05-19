import { Injectable } from '@nestjs/common';
import { SummarizationStub } from './stubs/summarization.stub';
import { SentimentStub } from './stubs/sentiment.stub';
import { LeadScoringStub } from './stubs/lead-scoring.stub';
import { ObjectionDetectionStub } from './stubs/objection-detection.stub';
import { DealForecast, ForecastingStub } from './stubs/forecasting.stub';

@Injectable()
export class AiService {
  constructor(
    private readonly summarization: SummarizationStub,
    private readonly sentimentImpl: SentimentStub,
    private readonly leadScoring: LeadScoringStub,
    private readonly objectionDetection: ObjectionDetectionStub,
    private readonly forecasting: ForecastingStub,
  ) {}

  summarize(text: string): Promise<string> {
    return this.summarization.summarize(text);
  }

  sentiment(text: string): Promise<number> {
    return this.sentimentImpl.analyze(text);
  }

  scoreLead(contactId: string): Promise<number> {
    return this.leadScoring.score(contactId);
  }

  detectObjections(text: string): Promise<string[]> {
    return this.objectionDetection.detect(text);
  }

  forecast(dealId: string): Promise<DealForecast> {
    return this.forecasting.forecast(dealId);
  }
}
