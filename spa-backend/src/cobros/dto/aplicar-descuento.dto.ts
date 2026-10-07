/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class AplicarDescuentoDto {
  @IsString()
  @IsNotEmpty()
  codigo_descuento!: string;
}
