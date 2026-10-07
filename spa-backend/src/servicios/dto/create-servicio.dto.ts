/* eslint-disable prettier/prettier */

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';

// Este DTO define la estructura y las reglas de validación
// para los datos necesarios al crear un nuevo servicio.
export class CreateServicioDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber({}, { message: 'La duración debe ser un número' })
  @IsPositive({ message: 'La duración debe ser un número positivo' })
  duracion: number;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  precio: number;

  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  @IsOptional()
  imagen_url?: string;

  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activo?: boolean;

  // --- NUEVA PROPIEDAD ---
  // Aceptamos un ID numérico opcional para el servicio padre.
  @IsNumber({}, { message: 'El ID del servicio padre debe ser un número' })
  @IsPositive({ message: 'El ID del servicio padre debe ser un número positivo' })
  @IsOptional()
  parent_servicio_id?: number;
}
