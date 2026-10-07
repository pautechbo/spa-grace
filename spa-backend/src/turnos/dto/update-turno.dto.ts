/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoDto } from './create-turno.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

// Hacemos que todos los campos de creación sean opcionales.
export class UpdateTurnoDto extends PartialType(CreateTurnoDto) {
  // Añadimos una propiedad específica para actualizar el estado.
  @IsString()
  @IsEnum([
    'pendiente',
    'confirmado',
    'cancelado',
    'atendido',
    'ausente',
    'reprogramado',
  ])
  @IsOptional()
  estado?: string;
}
