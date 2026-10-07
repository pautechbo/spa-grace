/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateCobroDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @IsInt()
  id_turno!: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  monto_total!: number;
}
