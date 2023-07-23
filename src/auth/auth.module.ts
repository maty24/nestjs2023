import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './stategies/jwt-strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Auth]),

    //el tipo de estrategia
    PassportModule.register({
      //el tipo de estrategia
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      //para las variables de entorno
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        return {
          //numero secreto
          secret: configService.get('JWT_SECRET'),
          //expiracion del token
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
    /*
    JwtModule.register({
      //numero secreto
      secret: '',
      //expiracion del token
      signOptions:{
        expiresIn: '2h'
      }
    })*/
  ],
  //por si quiero usar estos moduos fuera
  exports:[TypeOrmModule,/*VERIFICXAR TOKEN MANUAL */JwtStrategy,PassportModule,JwtModule]
})
export class AuthModule {}
