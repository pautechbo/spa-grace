/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

// Esta es la clave que usaremos para almacenar y recuperar los roles.
export const ROLES_KEY = 'roles';

// Este es nuestro decorador personalizado.
// Acepta una lista de roles (ej: 'admin', 'terapeuta') y los adjunta
// como metadatos al endpoint donde se use.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
