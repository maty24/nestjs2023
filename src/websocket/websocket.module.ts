import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [WebsocketGateway, WebsocketService],
  imports: [AuthModule],
})
export class WebsocketModule {}
