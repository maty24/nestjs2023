import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { WebsocketService } from './websocket.service';
import { NewMessageDto } from './dto/create-websocket.dto';
import { Socket, Server } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true, namespace: 'casa' })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //tiene la informacion de todos los clientes conectados
  @WebSocketServer() wss: Server;

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
  ) {}

  //interfaz de desconexion
  //el cliente es tipo socket, el client trae un token 
  async handleConnection( client: Socket ) {
    //registramos al clinete al conectar
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
      await this.websocketService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.websocketService.getConnectedClients(),
    );
  }

  //interfaz de conexion
  handleDisconnect( client: Socket ) {
    // console.log('Cliente desconectado', client.id )
    this.websocketService.removeClient( client.id );

    this.wss.emit('clients-updated', this.websocketService.getConnectedClients() );
  }



//espera el nombre del evento, tengo acceso al cliente y al payload, osea estoy en la escucha para tener parametros
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {


    //! Emite únicamente al cliente no a todoa.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emitir a todos MENOS, al cliente inicial, broadcast es que ignora al clioente
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //cuando llegan los parametros se ejecuta el emit
    this.wss.emit('message-from-server', {
      fullName: this.websocketService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    });
  }
}
