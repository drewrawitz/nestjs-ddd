import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:userId')
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.usersService.getUserDetails(userId);
  }
}
