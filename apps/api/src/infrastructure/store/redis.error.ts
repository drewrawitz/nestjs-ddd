export class RedisError extends Error {
  constructor(
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
