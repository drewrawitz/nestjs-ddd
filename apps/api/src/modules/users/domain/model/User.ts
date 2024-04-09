import { Email } from './Email';

export class User {
  id?: string;
  email: Email;
  firstName: string | null;
  lastName: string | null;

  constructor({
    id,
    email,
    firstName = null,
    lastName = null,
  }: {
    id?: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  }) {
    this.id = id;
    this.email = new Email(email);
    this.firstName = firstName;
    this.lastName = lastName;
  }

  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }
}
