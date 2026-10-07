/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoEmpleadoDto } from './create-pago-empleado.dto';

export class UpdatePagoEmpleadoDto extends PartialType(CreatePagoEmpleadoDto) {}
