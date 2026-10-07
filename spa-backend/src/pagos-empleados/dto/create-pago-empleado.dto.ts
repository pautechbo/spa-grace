/* eslint-disable prettier/prettier */
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePagoEmpleadoDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id_empleado: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_pago: Date;

  @IsDateString()
  @IsNotEmpty()
  periodo_inicio: Date;

  @IsDateString()
  @IsNotEmpty()
  periodo_fin: Date;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  monto_bruto: number;

  @IsNumber()
  @IsOptional()
  deducciones?: number;

  @IsString()
  @IsOptional()
  metodo_pago?: string;

  @IsString()
  @IsOptional()
  referencia_pago?: string;

  @IsString()
  @IsOptional()
  notas?: string;
}
