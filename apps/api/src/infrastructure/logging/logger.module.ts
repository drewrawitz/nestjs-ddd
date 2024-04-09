import { Module, Global } from '@nestjs/common';
import { LOGGER_TOKEN } from './logger.token';
import { WinstonLogger } from './winston.logger';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: WinstonLogger,
    },
  ],
  exports: [LOGGER_TOKEN],
})
export class LoggerModule {}
