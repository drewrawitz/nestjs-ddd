export interface SendEmailProps {
  to: string;
  from: string;
  subject: string;
  message: string;
}

export interface IEmailService {
  sendEmail(props: SendEmailProps): Promise<void>;
}
