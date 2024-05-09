export interface IUserSessionManager {
  removeMfaSession(key: string): Promise<void>;
  getMfaSession(key: string): Promise<{
    userId: string;
    types: string[];
  } | null>;
  saveMfaSession(key: string, userId: string, types: string[]): Promise<void>;
  saveUserSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<void>;
  removeSessionFromRedis(userId: string, sessionId: string): Promise<void>;
  removeAllUserSessions(userId: string): Promise<void>;
}
