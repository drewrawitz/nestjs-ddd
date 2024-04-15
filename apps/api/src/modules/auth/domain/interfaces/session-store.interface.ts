export interface IUserSessionStore {
  saveUserSession(
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>,
  ): Promise<void>;
  removeSessionFromRedis(userId: string, sessionId: string): Promise<void>;
  saveForgotPasswordToken(email: string, token: string): Promise<void>;
  invalidateForgotPasswordToken(email: string): Promise<void>;
}
