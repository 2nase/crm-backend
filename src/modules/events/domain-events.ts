import { DealStage, TaskPriority, TaskType } from '@prisma/client';

export enum DomainEvent {
  CONTACT_CREATED = 'contact.created',
  DEAL_UPDATED = 'deal.updated',
  CALL_FINISHED = 'call.finished',
  EMAIL_SENT = 'email.sent',
  TASK_CREATED = 'task.created',
  TASK_OVERDUE = 'task.overdue',
  CONTACT_INACTIVE_14_DAYS = 'contact.inactive_14_days',
}

export const ALL_DOMAIN_EVENTS: readonly DomainEvent[] = Object.values(DomainEvent);

export interface BaseEventPayload {
  occurredAt: Date;
}

export interface ContactCreatedPayload extends BaseEventPayload {
  contactId: string;
  name: string;
  email: string | null;
}

export interface DealUpdatedPayload extends BaseEventPayload {
  dealId: string;
  contactId: string;
  fromStage: DealStage | null;
  toStage: DealStage;
  stageChanged: boolean;
}

export interface CallFinishedPayload extends BaseEventPayload {
  callId: string;
  contactId: string;
  duration: number;
  hasTranscript: boolean;
}

export interface EmailSentPayload extends BaseEventPayload {
  emailId: string;
  contactId: string;
  templateId: string | null;
  subject: string;
}

export interface TaskCreatedPayload extends BaseEventPayload {
  taskId: string;
  contactId: string;
  dealId: string | null;
  type: TaskType;
  priority: TaskPriority;
  dueDate: Date | null;
}

export interface TaskOverduePayload extends BaseEventPayload {
  taskId: string;
  contactId: string;
  dealId: string | null;
  dueDate: Date;
}

export interface ContactInactivePayload extends BaseEventPayload {
  contactId: string;
  lastInteraction: Date | null;
  daysSinceInteraction: number;
}

export interface EventPayloadMap {
  [DomainEvent.CONTACT_CREATED]: ContactCreatedPayload;
  [DomainEvent.DEAL_UPDATED]: DealUpdatedPayload;
  [DomainEvent.CALL_FINISHED]: CallFinishedPayload;
  [DomainEvent.EMAIL_SENT]: EmailSentPayload;
  [DomainEvent.TASK_CREATED]: TaskCreatedPayload;
  [DomainEvent.TASK_OVERDUE]: TaskOverduePayload;
  [DomainEvent.CONTACT_INACTIVE_14_DAYS]: ContactInactivePayload;
}

export type AnyEventPayload = EventPayloadMap[DomainEvent];

export type EventHandler<E extends DomainEvent> = (
  payload: EventPayloadMap[E],
) => void | Promise<void>;
