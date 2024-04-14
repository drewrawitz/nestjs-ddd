import { NestFactory } from '@nestjs/core';
import session from '@fastify/session';
import cookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { EnvService } from './infrastructure/env/env.service';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      rawBody: true,
    },
  );
  const configService = app.get(EnvService);

  // Initialize Redis client.
  const redisClient = new Redis({
    enableAutoPipelining: true,
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  });

  // Initialize Redis store.
  const redisStore = new RedisStore({
    client: redisClient,
  });

  await app.register(cookie, {
    secret: configService.get('COOKIE_SECRET'),
  });

  await app.register(session, {
    secret: configService.get('SESSION_SECRET'),
    cookie: { secure: false },
    store: redisStore,
    saveUninitialized: false,
  });

  await app.listen(configService.get('PORT'));
}
bootstrap();
