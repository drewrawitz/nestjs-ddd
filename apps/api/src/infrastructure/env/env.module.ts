import { ConfigModule } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { envSchema } from './env.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
