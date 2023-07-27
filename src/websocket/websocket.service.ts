import { Injectable } from '@nestjs/common';
import { NewMessageDto } from './dto/create-websocket.dto';
import { Socket } from 'socket.io';
import { Auth } from 'src/auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//esto son los socketid, de un monton de los clientes
interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: Auth;
  };
}

@Injectable()
export class WebsocketService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(Auth)
    private readonly userRepository: Repository<Auth>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = {
      socket: client,
      user: user,
    };
  }

  //para que me borre el cliente
  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  private checkUserConnection(user: Auth) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
