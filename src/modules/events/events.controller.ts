import { Controller, Get } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Controller('events')
export class EventsController {
  constructor(private readonly bus: EventBusService) {}

  @Get()
  list(): { events: readonly string[] } {
    return { events: this.bus.listEventTypes() };
  }
}
