import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module, Global } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { EmailLogRepository } from 'src/infrastructure/email/email-log.repository';
import { EmailLogService } from 'src/infrastructure/email/email-log.service';
import {
  EMAIL_LOG_REPO_TOKEN,
  EMAIL_SERVICE_TOKEN,
  EMAIL_TOKEN,
} from 'src/infrastructure/email/email.token';
import { MailcatcherEmailService } from 'src/infrastructure/email/mailcatcher.email.service';
import { QueuedEmailServiceDecorator } from 'src/infrastructure/email/queued.email.service.decorator';
import { EnvModule } from 'src/infrastructure/env/env.module';
import { EventModule } from 'src/infrastructure/events/event.module';
import { BullJobService } from 'src/infrastructure/jobs/bullMq.job.service';
import { JOBS_TOKEN } from 'src/infrastructure/jobs/jobs.token';
import { EMAIL_QUEUE, STRIPE_QUEUE } from 'src/infrastructure/jobs/jobs.types';
import { LoggerModule } from 'src/infrastructure/logging/logger.module';
import { RedisModule } from 'src/infrastructure/store/redis.module';
import { StripeRepository } from 'src/infrastructure/stripe/stripe.repository';
import { StripeService } from 'src/infrastructure/stripe/stripe.service';
import {
  STRIPE_REPO_TOKEN,
  STRIPE_TOKEN,
} from 'src/infrastructure/stripe/stripe.token';
import { ACCESS_REPO_TOKEN } from 'src/modules/access/application/access.constants';
import { AccessRepository } from 'src/modules/access/application/access.repository';
import {
  AUTH_CHALLENGE_MANAGER_TOKEN,
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from 'src/modules/auth/domain/auth.constants';
import { AuthChallengeManager } from 'src/modules/auth/infrastructure/auth-challenge.manager';
import { PasswordHashingService } from 'src/modules/auth/infrastructure/password-hashing.service';
import { PasswordResetManager } from 'src/modules/auth/infrastructure/password-reset.manager';
import { UserSessionManager } from 'src/modules/auth/infrastructure/user-session.manager';
import { USER_MFA_REPO_TOKEN } from 'src/modules/mfa/mfa.constants';
import { UserMFARepository } from 'src/modules/mfa/mfa.repository';
import { SUBSCRIPTIONS_REPO_TOKEN } from 'src/modules/subscriptions/application/subscriptions.constants';
import { SubscriptionsRepository } from 'src/modules/subscriptions/application/subscriptions.repository';
import { UsersRepository } from 'src/modules/users/application/repositories/users.repository';
import { USER_REPO_TOKEN } from 'src/modules/users/application/users.constants';

@Global()
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    LoggerModule,
    EnvModule,
    EventModule,
    BullModule.registerQueue({
      name: STRIPE_QUEUE,
    }),
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: STRIPE_QUEUE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: EMAIL_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    EmailLogService,
    {
      provide: PASSWORD_HASHING_TOKEN,
      useClass: PasswordHashingService,
    },
    {
      provide: USER_MFA_REPO_TOKEN,
      useClass: UserMFARepository,
    },
    {
      provide: SUBSCRIPTIONS_REPO_TOKEN,
      useClass: SubscriptionsRepository,
    },
    {
      provide: ACCESS_REPO_TOKEN,
      useClass: AccessRepository,
    },
    {
      provide: EMAIL_TOKEN,
      useClass: QueuedEmailServiceDecorator,
    },
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: MailcatcherEmailService,
    },
    {
      provide: EMAIL_LOG_REPO_TOKEN,
      useClass: EmailLogRepository,
    },
    {
      provide: JOBS_TOKEN,
      useClass: BullJobService,
    },
    {
      provide: STRIPE_TOKEN,
      useClass: StripeService,
    },
    {
      provide: STRIPE_REPO_TOKEN,
      useClass: StripeRepository,
    },
    {
      provide: PASSWORD_RESET_MANAGER_TOKEN,
      useClass: PasswordResetManager,
    },
    {
      provide: AUTH_CHALLENGE_MANAGER_TOKEN,
      useClass: AuthChallengeManager,
    },
    {
      provide: USER_SESSION_MANAGER_TOKEN,
      useClass: UserSessionManager,
    },
    {
      provide: USER_REPO_TOKEN,
      useClass: UsersRepository,
    },
  ],
  exports: [
    PASSWORD_HASHING_TOKEN,
    USER_MFA_REPO_TOKEN,
    SUBSCRIPTIONS_REPO_TOKEN,
    ACCESS_REPO_TOKEN,
    EMAIL_TOKEN,
    EMAIL_SERVICE_TOKEN,
    EMAIL_LOG_REPO_TOKEN,
    JOBS_TOKEN,
    STRIPE_TOKEN,
    STRIPE_REPO_TOKEN,
    PASSWORD_RESET_MANAGER_TOKEN,
    USER_SESSION_MANAGER_TOKEN,
    USER_REPO_TOKEN,
    AUTH_CHALLENGE_MANAGER_TOKEN,
  ],
})
export class SharedModule {}
