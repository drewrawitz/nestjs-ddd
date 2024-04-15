import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { ILogger } from '../logging/logger.interface';
import { RedisError } from './redis.error';
import { IStore } from './store.interface';
import { REDIS_CLIENT_TOKEN } from './store.constants';

@Injectable()
export class RedisStoreService implements IStore {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(REDIS_CLIENT_TOKEN) private client: Redis,
  ) {}

  async setWithExpiry(key: string, value: string, ttl: number) {
    try {
      await this.client.set(key, value, 'EX', ttl);
    } catch (error) {
      this.logger.error('Error setting a value with expiry in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to set value with expiry in Redis', error);
    }
  }

  async set(key: string, value: string) {
    try {
      await this.client.set(key, value);
    } catch (error) {
      this.logger.error('Error setting a value in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to set value in Redis', error);
    }
  }

  async hmset(key: string, value: any) {
    try {
      await this.client.hmset(key, value);
    } catch (error) {
      this.logger.error('Error setting a value in Redis', {
        key,
        value,
        error,
      });
      throw new RedisError('Redis client hmset failed', error);
    }
  }

  async get(key: string) {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error('Error getting a value in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to get value in Redis', error);
    }
  }

  async smembers(key: string) {
    try {
      await this.client.smembers(key);
    } catch (error) {
      this.logger.error('Error getting smembers in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to get smembers in Redis', error);
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Error deleting key in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to delete key in Redis', error);
    }
  }

  async sadd(key: string, value: any) {
    try {
      await this.client.sadd(key, value);
    } catch (error) {
      this.logger.error('Error adding members to a set in Redis', {
        key,
        error,
      });
      throw new RedisError('Failed to add members to a set in Redis', error);
    }
  }

  async srem(key: string, value: any) {
    try {
      await this.client.srem(key, value);
    } catch (error) {
      this.logger.error('Error removing members from a set in Redis', {
        key,
        error,
      });
      throw new RedisError(
        'Failed to remove members from a set in Redis',
        error,
      );
    }
  }
}
