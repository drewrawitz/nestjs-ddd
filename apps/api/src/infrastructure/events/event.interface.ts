export interface IEventPublisher {
  publish(name: string, payload: any): void;
}
