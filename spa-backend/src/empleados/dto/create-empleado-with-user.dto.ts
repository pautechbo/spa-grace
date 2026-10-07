/* eslint-disable prettier/prettier */
import { IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO interno para los datos del usuario
class CreateUserForEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsEnum(['terapeuta', 'recepcionista', 'admin'])
  @IsNotEmpty()
  rol!: 'terapeuta' | 'recepcionista' | 'admin';
}

// DTO principal que combina todo
export class CreateEmpleadoWithUserDto {
  @ValidateNested()
  @Type(() => CreateUserForEmpleadoDto)
  @IsNotEmpty()
  usuario!: CreateUserForEmpleadoDto;

  @IsString()
  @IsNotEmpty()
  especialidad!: string;
  
  @IsBoolean()
  @IsOptional()
  activo: boolean = true;
  
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  serviciosIds?: number[];
}
