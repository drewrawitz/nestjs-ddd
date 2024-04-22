import { Inject, Injectable } from '@nestjs/common';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';

@Injectable()
export class UserSessionManager implements IUserSessionManager {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STORE_TOKEN) private readonly store: IStore,
  ) {}

  async saveUserSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.store.set(sessionKey, JSON.stringify(metadata));
    await this.store.sadd(`user_sessions:${userId}`, sessionId);
  }

  async removeSessionFromRedis(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    await this.store.srem(`user_sessions:${userId}`, sessionId);
  }
}
