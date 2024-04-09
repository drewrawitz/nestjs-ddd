import { EventEmitter2 } from '@nestjs/event-emitter';
import { IEventPublisher } from '../../application/interfaces/IEventPublisher';

export class EventPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(name: string, payload: any): void {
    this.eventEmitter.emit(name, payload);
  }
}
