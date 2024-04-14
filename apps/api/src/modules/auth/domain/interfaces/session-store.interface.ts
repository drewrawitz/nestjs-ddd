export interface IUserSessionStore {
  saveUserSession(userId: string, sessionId: string): Promise<void>;
  removeSessionFromRedis(userId: string, sessionId: string): Promise<void>;
}
