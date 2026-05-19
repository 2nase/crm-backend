import { Injectable } from '@nestjs/common';

export interface DealForecast {
  probability: number;
  expectedCloseDate: Date | null;
}

@Injectable()
export class ForecastingStub {
  async forecast(dealId: string): Promise<DealForecast> {
    void dealId;
    return { probability: 0.5, expectedCloseDate: null };
  }
}
