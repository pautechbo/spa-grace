/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class AddServicioDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id_servicio: number;
}
