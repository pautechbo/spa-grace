/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateDisponibilidadDto } from './create-disponibilidad.dto';

// Hacemos que todos los campos sean opcionales, excepto id_empleado
// que no debería cambiarse en una actualización.
export class UpdateDisponibilidadDto extends PartialType(CreateDisponibilidadDto) {}
