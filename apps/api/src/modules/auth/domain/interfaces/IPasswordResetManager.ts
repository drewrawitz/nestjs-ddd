export interface IPasswordResetManager {
  saveForgotPasswordToken(email: string, token: string): Promise<void>;
  invalidateForgotPasswordToken(email: string): Promise<void>;
  getEmailFromForgotPasswordToken(token: string): Promise<string | null>;
  removeForgotPasswordTokens(email: string, token: string): Promise<void>;
}
