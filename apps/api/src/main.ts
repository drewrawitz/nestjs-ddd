import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './infrastructure/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvService);

  await app.listen(configService.get('PORT'));
}
bootstrap();
