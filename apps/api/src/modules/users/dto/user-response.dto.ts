import { User } from '../domain/model/User';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;

  constructor(user: User) {
    this.id = user.id!;
    this.email = user.email.getValue();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}
