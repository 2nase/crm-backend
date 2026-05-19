import { DomainEvent, AnyEventPayload } from '../events/domain-events';

export interface BaseAgent {
  readonly name: string;
  readonly triggerEvents: readonly DomainEvent[];
  execute(event: DomainEvent, payload: AnyEventPayload): Promise<void>;
}

export interface AgentMetadata {
  name: string;
  triggers: readonly DomainEvent[];
}
