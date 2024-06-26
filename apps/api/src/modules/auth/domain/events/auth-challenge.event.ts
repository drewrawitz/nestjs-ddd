import { RequestWithUser } from 'src/utils/types';
import { AuthChallengeDto } from '@app/shared';

export class AuthChallengeInitEvent {
  constructor(
    public readonly user: RequestWithUser['user'],
    public readonly token: string,
    public readonly body: AuthChallengeDto,
  ) {}
}
