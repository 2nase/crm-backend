import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ALL_DOMAIN_EVENTS,
  DomainEvent,
  EventHandler,
  EventPayloadMap,
} from './domain-events';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private readonly emitter: EventEmitter2) {}

  emit<E extends DomainEvent>(event: E, payload: EventPayloadMap[E]): void {
    this.logger.debug(`emit ${event}`);
    this.emitter.emit(event, payload);
  }

  on<E extends DomainEvent>(event: E, handler: EventHandler<E>): void {
    this.emitter.on(event, handler as (p: unknown) => void);
  }

  onAny(handler: (event: DomainEvent, payload: unknown) => void | Promise<void>): void {
    for (const evt of ALL_DOMAIN_EVENTS) {
      this.emitter.on(evt, (payload: unknown) => handler(evt, payload));
    }
  }

  listEventTypes(): readonly DomainEvent[] {
    return ALL_DOMAIN_EVENTS;
  }
}
