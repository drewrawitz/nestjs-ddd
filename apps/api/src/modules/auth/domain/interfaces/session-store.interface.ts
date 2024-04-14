export interface IUserSessionStore {
  saveUserSession(userId: string, sessionId: string): Promise<void>;
}
