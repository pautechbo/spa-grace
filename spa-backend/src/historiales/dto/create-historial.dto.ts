/* eslint-disable prettier/prettier */
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateHistorialDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id_cliente: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  id_turno?: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsOptional()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  tratamiento?: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsUrl()
  @IsOptional()
  archivo_url?: string;
}
