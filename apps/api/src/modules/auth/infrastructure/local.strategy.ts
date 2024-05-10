import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RequestWithUser } from 'src/utils/types';
import { MFAService } from 'src/modules/mfa/mfa.service';
import { USER_SESSION_MANAGER_TOKEN } from '../domain/auth.constants';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';
import { generateUUID } from 'src/utils/tokens';
import { MfaRequiredException } from 'src/modules/mfa/mfa.exceptions';
import { IUserResponse } from '@app/shared';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private mfaService: MFAService,
    @Inject(USER_SESSION_MANAGER_TOKEN)
    private readonly userSessionManager: IUserSessionManager,
  ) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(
    req: RequestWithUser,
    email: string,
    password: string,
  ): Promise<IUserResponse> {
    if (req.isAuthenticated?.()) {
      throw new ForbiddenException(
        'Already authenticated with an active session',
      );
    }

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    // Check if MFA is enabled for this user
    const activeMFA = await this.mfaService.getAllActiveMFAForUser(user.id);
    if (activeMFA?.length > 0) {
      const types = activeMFA.map((mfa) => mfa.type);
      const key = generateUUID();
      await this.userSessionManager.saveMfaSession(key, user.id, types);

      throw new MfaRequiredException(key, types);
    }

    return user;
  }
}
