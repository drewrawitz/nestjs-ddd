import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  NotFoundException,
  UseGuards,
  UsePipes,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { RequestWithUser } from 'src/utils/types';
import {
  ForgotPasswordDto,
  forgotPasswordSchema,
} from '../dto/forgot-password.dto';
import {
  ActivateTotpDto,
  VerifyMfaDto,
  activateTotpSchema,
  verifyMfaSchema,
} from '../../mfa/mfa.dto';
import {
  ResetPasswordDto,
  resetPasswordSchema,
} from '../dto/reset-password.dto';
import { SignupDto, signupSchema } from '../dto/signup.dto';
import {
  VerifyResetTokenDto,
  verifyResetTokenSchema,
} from '../dto/verify-reset-token.dto';
import { AuthenticatedGuard } from '../infrastructure/authenticated.guard';
import { LocalAuthGuard } from '../infrastructure/local.auth.guard';
import { AuthService } from './auth.service';
import { MFAService } from 'src/modules/mfa/mfa.service';
import {
  AuthChallengeDto,
  authChallengeSchema,
} from '../dto/auth-challenge.dto';
import { USER_SESSION_MANAGER_TOKEN } from '../domain/auth.constants';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mfaService: MFAService,
    @Inject(USER_SESSION_MANAGER_TOKEN)
    private readonly userSessionManager: IUserSessionManager,
  ) {}

  @Post('signup')
  @UsePipes(new ZodValidationPipe(signupSchema))
  async signup(@Req() req: RequestWithUser, @Body() body: SignupDto) {
    const user = await this.authService.signup(body);
    await this.authService.login(req, user);

    return user;
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    await this.authService.loginSuccess(req);
    return req.user;
  }

  @HttpCode(200)
  @Post('login/mfa')
  @UsePipes(new ZodValidationPipe(verifyMfaSchema))
  async loginMfa(@Req() req: RequestWithUser, @Body() body: VerifyMfaDto) {
    const { totp, tempKey } = body;

    try {
      const getKey = await this.userSessionManager.getMfaSession(tempKey);

      if (!getKey) {
        throw new ForbiddenException('Session validation failed.');
      }

      const { userId } = getKey;

      const isValid = await this.mfaService.verifyUserTotpToken(userId, totp);
      if (!isValid) {
        throw new UnauthorizedException('Verification failed.');
      }

      const user = await this.authService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User lookup failed.');
      }

      await this.authService.login(req, user);
      await this.userSessionManager.removeMfaSession(tempKey);

      return user;
    } catch (error) {
      console.error(`MFA Login Error: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(AuthenticatedGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res() res: Response) {
    res.clearCookie('connect.sid');
    await this.authService.logout(req);

    return res.send();
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Get('verify-reset-token')
  @UsePipes(new ZodValidationPipe(verifyResetTokenSchema))
  async verifyResetToken(@Query() query: VerifyResetTokenDto) {
    return await this.authService.verifyResetToken(query.token);
  }

  @HttpCode(204)
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('challenge/initiate')
  @UsePipes(new ZodValidationPipe(authChallengeSchema))
  async initiateAuthChallenge(
    @Req() req: RequestWithUser,
    @Body() body: AuthChallengeDto,
  ) {
    return await this.authService.initiateChallenge(req.user.id, body);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('mfa/totp/setup')
  async setupTotp() {
    return await this.mfaService.setupTotp();
  }

  @UseGuards(AuthenticatedGuard)
  @Post('mfa/totp/activate')
  @UsePipes(new ZodValidationPipe(activateTotpSchema))
  async activateTotp(
    @Req() req: RequestWithUser,
    @Body() body: ActivateTotpDto,
  ) {
    return await this.mfaService.activateTotp(req.user.id, body);
  }
}
