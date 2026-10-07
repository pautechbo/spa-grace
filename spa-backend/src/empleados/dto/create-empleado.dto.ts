/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEmpleadoDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id_usuario: number;

  @IsString()
  @IsOptional()
  especialidad?: string;
}
