export interface IStore {
  setWithExpiry(key: string, value: string, ttl: number): Promise<void>;
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  smembers(key: string): Promise<void>;
  del(key: string): Promise<void>;
  sadd(key: string, value: any): Promise<void>;
  srem(key: string, value: any): Promise<void>;
}
