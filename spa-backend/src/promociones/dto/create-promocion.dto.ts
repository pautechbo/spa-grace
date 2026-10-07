/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  IsEnum,
  IsNumber,
  IsPositive,
  IsBoolean,
} from 'class-validator';

export class CreatePromocionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsUrl()
  @IsOptional()
  imagen_url?: string;

  @IsDateString()
  @IsOptional()
  fecha_inicio?: Date;

  @IsDateString()
  @IsOptional()
  fecha_fin?: Date;

  @IsString()
  @IsOptional()
  codigo_descuento?: string;

  @IsEnum(['porcentaje', 'fijo'])
  @IsOptional()
  tipo_descuento?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  valor_descuento?: number;

  @IsEnum(['todos', 'servicio_especifico', 'categoria', 'cumpleanos'])
  @IsOptional()
  aplica_a?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  id_servicio_aplicable?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
