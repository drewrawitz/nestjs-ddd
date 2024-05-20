import { IPasswordHashingService } from 'src/modules/auth/domain/interfaces/IPasswordHashingService';
import { Email } from './Email';
import { UserMFA } from '@prisma/client';

export class User {
  constructor(
    public readonly props: {
      id?: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      stripeCustomerId?: string | null;
      emailVerifiedAt?: Date;
      passwordHash?: string | null;
      mfa?: UserMFA[];
    },
  ) {}

  get id() {
    return this.props.id;
  }

  get passwordHash() {
    return this.props.passwordHash;
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

  get mfa() {
    const { mfa } = this.props;
    return (
      mfa?.map((m) => ({
        type: m.type,
        createdAt: m.createdAt,
      })) ?? []
    );
  }

  async setPassword(
    password: string,
    passwordHashingService: IPasswordHashingService,
  ): Promise<void> {
    this.props.passwordHash = await passwordHashingService.hash(password);
  }

  async validatePassword(
    password: string,
    passwordHashingService: IPasswordHashingService,
  ): Promise<boolean> {
    if (!this.props.passwordHash) {
      return false;
    }

    return passwordHashingService.compare(password, this.props.passwordHash);
  }
}
