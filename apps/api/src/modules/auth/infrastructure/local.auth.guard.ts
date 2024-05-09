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
        const responseObject = {
          type: 'MFA_REQUIRED',
          message: 'MFA required',
          mfaRequired: true,
          mfaTypes: error.mfaTypes,
          tempKey: error.tempKey,
        } as LoginMfaResponseType;

        response.status(HttpStatus.OK).json(responseObject);
        return false;
      } else {
        // Rethrow the original error if it's not related to MFA
        throw error;
      }
    }
  }
}
