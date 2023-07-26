import { SetMetadata } from '@nestjs/common';

enum validroles {
  admin = 'admin',
  superUser = 'super-user',
  user = 'user',
}

export const META_ROLES = 'roles';

///LOS ARGS son los argumentos que le entran al decorator
export const RoleProtected = (...args: validroles[]) => {
  return SetMetadata(META_ROLES, args);
};
