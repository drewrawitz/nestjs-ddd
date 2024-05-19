import { Module } from '@nestjs/common';
import { AppWebsocketsGateway } from './websockets.gateway';

@Module({
  providers: [AppWebsocketsGateway],
  exports: [AppWebsocketsGateway],
})
export class WebsocketsModule {}
