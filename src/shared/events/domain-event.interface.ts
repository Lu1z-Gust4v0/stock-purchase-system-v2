export interface DomainEvent {
  occurredAt: Date;

  toJSON(): object;
}
