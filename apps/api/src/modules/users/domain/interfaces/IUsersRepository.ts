import { UserResponseDto } from '../../dto/user-response.dto';
import { User } from '../model/User';

export interface IUsersRepository {
  existsByEmail(email: string): Promise<boolean>;
  getUserIdFromStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<string | null>;
  getUserById(userId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  createUser(user: User): Promise<UserResponseDto>;
  updateUserWithStripeCustomerId(
    userId: string,
    stripeCustomerId: string,
  ): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
}
