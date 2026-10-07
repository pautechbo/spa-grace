/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Inyectamos 'Reflector' para poder leer los metadatos que adjuntamos con el decorador.
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtenemos los roles requeridos para este endpoint específico.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no se especifican roles en el endpoint, permitimos el acceso.
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtenemos el objeto 'user' que fue añadido a la petición por el JwtAuthGuard.
    const { user } = context.switchToHttp().getRequest();

    // 3. Comparamos el rol del usuario con la lista de roles requeridos.
    // Si hay alguna coincidencia, permitimos el acceso.
    return requiredRoles.some((role) => user.rol === role);
  }
}
