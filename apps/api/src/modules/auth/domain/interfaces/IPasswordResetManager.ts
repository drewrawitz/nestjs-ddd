export interface IPasswordResetManager {
  saveForgotPasswordToken(email: string, token: string): Promise<void>;
  invalidateForgotPasswordToken(email: string): Promise<void>;
}
