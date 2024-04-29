import { Global, Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPublisher } from './event.publisher';
import { EVENT_TOKEN } from './event.token';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_TOKEN,
      useFactory: (eventEmitter: EventEmitter2) =>
        new EventPublisher(eventEmitter),
      inject: [EventEmitter2],
    },
  ],
  exports: [EVENT_TOKEN],
})
export class EventModule {}
