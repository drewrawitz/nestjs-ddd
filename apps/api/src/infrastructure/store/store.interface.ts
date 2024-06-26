export interface IStore {
  setWithExpiry(key: string, value: any, ttl: number): Promise<void>;
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  smembers(key: string): Promise<string[]>;
  del(key: string): Promise<void>;
  sadd(key: string, value: any): Promise<void>;
  srem(key: string, value: any): Promise<void>;
  hmset(key: string, value: any): Promise<void>;
}
