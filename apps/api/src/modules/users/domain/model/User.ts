import { Email } from './Email';

export class User {
  private passwordHash?: string;

  constructor(
    public readonly props: {
      id?: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      stripeCustomerId?: string | null;
      emailVerifiedAt?: Date;
      passwordHash?: string;
    },
  ) {
    if (props.passwordHash) {
      this.passwordHash = props.passwordHash;
    }
  }

  get id() {
    return this.props.id;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get stripeCustomerId() {
    return this.props.stripeCustomerId;
  }

  get email() {
    return new Email(this.props.email);
  }

  get fullName(): string {
    return [this.props.firstName, this.props.lastName]
      .filter(Boolean)
      .join(' ');
  }

  get isEmailVerified(): boolean {
    return Boolean(this.props.emailVerifiedAt);
  }
}
