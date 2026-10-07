/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Este Guard simplemente extiende el AuthGuard que nos provee Passport.
// Al pasarle 'jwt' como argumento, le decimos que debe usar la estrategia JWT
// que registramos anteriormente. No necesitamos escribir ninguna lógica adicional aquí.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
