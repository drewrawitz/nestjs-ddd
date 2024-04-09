import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { PrismaModule } from '../database/prisma.module';
import { UsersService } from './users.service';
import { UserDomainService } from './domain/services/user.domain.service';
import { EventModule } from 'src/infrastructure/events/event.module';
import { UserCreatedListener } from './domain/listeners/user-created.listener';
import { EmailModule } from 'src/infrastructure/email/email.module';

@Module({
  imports: [PrismaModule, EventModule, EmailModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UserCreatedListener,
    UsersService,
    UserDomainService,
  ],
})
export class UsersModule {}
