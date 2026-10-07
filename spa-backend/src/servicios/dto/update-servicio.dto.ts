/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PartialType } from '@nestjs/mapped-types';
import { CreateServicioDto } from './create-servicio.dto';

// UpdateServicioDto extiende de CreateServicioDto usando PartialType.
// Esto automáticamente hace que todas las propiedades de CreateServicioDto
// sean opcionales. Así, el frontend puede enviar solo los campos
// que desea actualizar, sin necesidad de enviar el objeto completo.
export class UpdateServicioDto extends PartialType(CreateServicioDto) {}
