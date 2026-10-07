/* eslint-disable prettier/prettier */
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateCobroDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  monto_adelanto?: number;

  @IsString()
  @IsOptional()
  metodo_pago_adelanto?: string;

  @IsString()
  @IsOptional()
  metodo_pago_final?: string;

  @IsEnum([
    'pendiente_adelanto',
    'adelanto_pagado',
    'pagado_completo',
    'cancelado',
    'reembolsado',
  ])
  @IsOptional()
  estado_pago?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
