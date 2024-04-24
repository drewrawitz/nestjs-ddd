import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { RequestWithUser } from 'src/utils/types';
import {
  ForgotPasswordDto,
  forgotPasswordSchema,
} from '../dto/forgot-password.dto';
import { ActivateTotpDto, activateTotpSchema } from '../dto/mfa.dto';
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

@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    return;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('mfa/totp/setup')
  async setupTotp() {
    return await this.authService.setupTotp();
  }

  @UseGuards(AuthenticatedGuard)
  @Post('mfa/totp/activate')
  @UsePipes(new ZodValidationPipe(activateTotpSchema))
  async activateTotp(
    @Req() req: RequestWithUser,
    @Body() body: ActivateTotpDto,
  ) {
    return await this.authService.activateTotp(req.user.id, body);
  }
}
