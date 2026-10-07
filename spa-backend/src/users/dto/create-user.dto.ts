/* eslint-disable prettier/prettier */
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

// Definimos los roles posibles para asegurar que solo se usen valores válidos.
export enum UserRole {
  ADMIN = 'admin',
  RECEPCIONISTA = 'recepcionista',
  TERAPEUTA = 'terapeuta',
  CLIENTE = 'cliente',
}

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  rol: UserRole;
}
