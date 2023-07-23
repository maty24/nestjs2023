import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Auth } from '../entities/auth.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

//cunado pase una ruta va a pasar por equi cuando se autentica por una ruta
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Auth)
    private readonly userRepository: Repository<Auth>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      //el token va a ser un bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  //voy a validar el payload del jwt
  //estoy tipando el payload
  async validate(payload: JwtPayload): Promise<Auth> {
    //saco el email del payload, que es del jwt
    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new UnauthorizedException('Token not valid');

    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk with an admin');

    //request, esto se anade a la request , osea si le envio el token me retorna esto
    return user;
  }
}
