import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginUserDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth } from './entities/auth.entity';
import { GetUser, RawHeaders, RoleProtected ,AuthD} from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { validroles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  //me pide un token o algo para hacer la peticion, y AuthGuard  validad el token de stategies
  @UseGuards(AuthGuard())
  testPrivateRoute(
    //@Req() request: Express.Request) {
    //la reques me traer el user
    //console.log({ user: request.user });

    //este decorador le pongo un nombre para ver que tiene ese decorador
    @GetUser() user: Auth,
    @RawHeaders() rawHeader: string[],
  ) {
    return {
      ok: true,
      message: 'Hola desde ruta privada',
      user: user,
      rawHeader,
    };
  }

  @Get('private2')
  //le digo los roles que estan permitos para hacer lapeticon de esta ruta
  @RoleProtected(validroles.admin, validroles.superUser, validroles.user)
  //el metadata para andir informacion extra al controlador
  //@SetMetadata('roles', ['admin', 'super-user'])

  //le encio el guard , si me retorna un false , no me va a dejar pasar, el useguar me va a verificar el rol
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRute2(@GetUser() user: Auth) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  //el decortor contiene toda la lagica para segurizar la api
  @AuthD()
  privateRute3(@GetUser() user: Auth) {
    return {
      ok: true,
      user,
    };
  }
}
