import { LoginMfaResponseType } from '@app/shared';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MfaRequiredException } from 'src/modules/mfa/mfa.exceptions';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      const result = (await super.canActivate(context)) as boolean;
      await super.logIn(request);
      return result;
    } catch (error) {
      if (error instanceof MfaRequiredException) {
        const responseObject: LoginMfaResponseType = {
          type: 'MFA_REQUIRED',
          data: {
            message: 'MFA required',
            mfaRequired: true,
            mfaTypes: error.mfaTypes,
            tempKey: error.tempKey,
          },
        };

        response.status(HttpStatus.OK).json(responseObject);
        return false;
      } else {
        // Rethrow the original error if it's not related to MFA
        throw error;
      }
    }
  }
}
