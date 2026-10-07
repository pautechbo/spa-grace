import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTurnoDto {

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id_cliente: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id_empleado: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  id_servicios: number[];

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'La hora debe tener el formato HH:MM o HH:MM:SS',
  })
  hora: string;
}
