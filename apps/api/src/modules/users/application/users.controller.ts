import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from 'src/utils/types';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from 'src/modules/auth/infrastructure/authenticated.guard';

@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('/me')
  async getCurrentUser(@Req() req: RequestWithUser) {
    return req.user;
  }

  @Get('/:userId')
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.usersService.getUserDetails(userId);
  }
}