import ms from 'ms';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import RedisStore from 'connect-redis';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { EnvService } from './infrastructure/env/env.service';
import { REDIS_CLIENT_TOKEN } from './infrastructure/store/store.constants';
import { UserAgentMiddleware } from './common/middleware/useragent.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(EnvService);

  // Initialize Redis client.
  const redisClient = app.get(REDIS_CLIENT_TOKEN);

  // Initialize Redis store.
  const redisStore = new RedisStore({
    client: redisClient,
  });

  /**
   * Sessions
   */
  app.use(
    session({
      store: redisStore,
      secret: configService.get('SESSION_SECRET') ?? '',
      resave: false,
      cookie: {
        maxAge: ms('7d'),
      },
      rolling: true,
      saveUninitialized: false,
    }),
  );

  /**
   * Cors
   */
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(new UserAgentMiddleware().use);

  await app.listen(configService.get('PORT'));
}
bootstrap();
