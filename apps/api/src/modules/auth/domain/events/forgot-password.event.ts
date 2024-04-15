export class ForgotPasswordEvent {
  constructor(
    public readonly email: string,
    public readonly token: string,
  ) {}
}
