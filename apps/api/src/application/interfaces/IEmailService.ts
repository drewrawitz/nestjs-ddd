export interface IEmailService {
  sendWelcomeEmail(recipient: string): Promise<void>;
}
