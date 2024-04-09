import { UserResponseDto } from '../../dto/user-response.dto';

export class UserCreatedEvent {
  constructor(public readonly user: UserResponseDto) {}
}
