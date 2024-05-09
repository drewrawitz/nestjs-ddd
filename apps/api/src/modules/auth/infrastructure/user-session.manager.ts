import { Inject, Injectable } from '@nestjs/common';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';
import { STORE_TOKEN } from 'src/infrastructure/store/store.constants';
import { IStore } from 'src/infrastructure/store/store.interface';

@Injectable()
export class UserSessionManager implements IUserSessionManager {
  constructor(@Inject(STORE_TOKEN) private readonly store: IStore) {}

  async saveMfaSession(
    key: string,
    userId: string,
    types: string[],
  ): Promise<void> {
    await this.store.setWithExpiry(
      `mfa:${key}`,
      JSON.stringify({
        userId,
        types,
      }),
      300,
    );
  }

  async getMfaSession(key: string): Promise<{
    userId: string;
    types: string[];
  } | null> {
    const data = await this.store.get(`mfa:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async removeMfaSession(key: string): Promise<void> {
    await this.store.del(`mfa:${key}`);
  }

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
    await Promise.all([
      this.store.srem(`user_sessions:${userId}`, sessionId),
      this.store.del(`session:${sessionId}`),
      this.store.del(`sess:${sessionId}`),
    ]);
  }

  async removeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessionIds(userId);

    for (const sessionId of sessions) {
      await this.removeSessionFromRedis(userId, sessionId);
    }
  }

  private async getUserSessionIds(userId: string) {
    const key = `user_sessions:${userId}`;
    return await this.store.smembers(key);
  }
}
