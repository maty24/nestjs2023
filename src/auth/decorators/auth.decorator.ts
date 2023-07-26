import { UseGuards, applyDecorators } from '@nestjs/common';
import { validroles } from '../interfaces/valid-roles';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';

export function AuthD(...roles: validroles[]) {
  return applyDecorators(
    //este seria el setmetadata que me trae los roles que me envian por parametros
    RoleProtected(...roles),

    //authguard es el passport, useroleguad para que use la instancia
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
