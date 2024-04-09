export class Email {
  private value: string;

  constructor(email: string) {
    this.value = email;
  }

  public getValue(): string {
    return this.value.trim().toLowerCase();
  }
}
