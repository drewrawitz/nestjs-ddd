export interface IUserSessionManager {
  saveUserSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<void>;
  removeSessionFromRedis(userId: string, sessionId: string): Promise<void>;
}
