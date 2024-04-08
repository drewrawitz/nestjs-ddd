export class Email {
  private value: string;

  constructor(email: string) {
    if (!email.includes('@')) {
      throw new Error('Email must contain @ symbol.');
    }
    this.value = email;
  }

  public getValue(): string {
    return this.value.trim().toLowerCase();
  }
}
