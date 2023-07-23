import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//importo todo e la libreria a nombre de bcrypt
import * as bcrypt from 'bcrypt';

import { CreateAuthDto, LoginUserDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly userRepository: Repository<Auth>,

    //este es el servicio lo prorpciona el jwtmodule
    private readonly jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    try {
      const { password, ...userData } = createAuthDto;
      const user = this.userRepository.create({
        ...userData,
        //estoy encriptando la contrasena y le da como 10 vueltas
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return {
        ...user,
        //le tengo que enviar un objeto con el email
        token: this.getJwtToken({ email: user.email }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      //cuando tenga el usuario quiero que me retorne esto nomas, el email y el password
      select: { email: true, password: true },
    });
    //si no encuntra el usuario
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales incorrectas');

    return {
      ...user,
      //le tengo que enviar un objeto con el email
      token: this.getJwtToken({ email: user.email }),
    };
  }

  //el tipado del payload
  private getJwtToken(payload: JwtPayload) {
    //esto me genera el token
    const token = this.jwtService.sign(payload);
    //me regresa el token
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
