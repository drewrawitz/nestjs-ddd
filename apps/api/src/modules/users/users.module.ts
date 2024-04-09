import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../database/prisma.module';
import { UsersService } from './users.service';
import { UserDomainService } from './domain/services/user.domain.service';
import { EventModule } from 'src/infrastructure/events/event.module';

@Module({
  imports: [PrismaModule, EventModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, UserDomainService],
})
export class UsersModule {}
