import { Module } from '@nestjs/common';
import { EVENT_TOKEN } from './event.token';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPublisher } from './event.publisher';

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