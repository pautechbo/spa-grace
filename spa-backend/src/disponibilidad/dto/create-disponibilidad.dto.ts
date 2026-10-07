/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Matches } from 'class-validator';

export class CreateDisponibilidadDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id_empleado: number;

  @IsEnum([
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo',
  ])
  @IsNotEmpty()
  dia_semana: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora de inicio debe tener el formato HH:MM o HH:MM:SS',
  })
  hora_inicio: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora de fin debe tener el formato HH:MM o HH:MM:SS',
  })
  hora_fin: string;
}
