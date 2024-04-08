import { UserResponseDto } from '../dto/user.response.dto';
import { User } from '../user.entity';

export interface IUsersRepository {
  createUser(user: User): Promise<UserResponseDto>;
}
