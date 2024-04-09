import { IEventPublisher } from '../../application/interfaces/IEventPublisher';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class EventPublisher implements IEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(name: string, payload: any): void {
    this.eventEmitter.emit(name, payload);
  }
}
