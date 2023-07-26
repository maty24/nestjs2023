import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    )
    //si no viene ningun rol, me retona todo pero debe venir un token
      if ( !validRoles ) return true;

      //lo misimo si no viene nada me retona un tru
      if ( validRoles.length === 0 ) return true;
      
      const req = context.switchToHttp().getRequest();
      const user = req.user as Auth;
  

      // si viene un rol, valida el usuario y si no  existe el usario, mesale un error
      if ( !user ) 
        throw new BadRequestException('User not found');
      
      
        
      for (const role of user.roles ) {
        if ( validRoles.includes( role ) ) {
          return true;
        }
      }

      //si el rol que tiene el usario no coincide con el rol que le puse en los parametros del decorator me retorna que no tiene un rol valido
      throw new ForbiddenException(
        `User ${ user.fullName } need a valid role: [${ validRoles }]`
      );
  }
}
