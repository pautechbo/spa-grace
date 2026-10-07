/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('disponibilidad')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('admin', 'recepcionista') // Solo admin y recepcionista pueden gestionar horarios
export class DisponibilidadController {
  constructor(
    private readonly disponibilidadService: DisponibilidadService,
  ) {}

  // POST /disponibilidad
  @Post()
  create(@Body() createDto: CreateDisponibilidadDto) {
    return this.disponibilidadService.create(createDto);
  }

  @Post('replace-all')
  replaceAll(@Body() body: { id_empleado: number; horarios: { dia_semana: string; hora_inicio: string; hora_fin: string }[] }) {
    return this.disponibilidadService.replaceAll(body.id_empleado, body.horarios);
  }

  @Get('empleado/:id')
  findAllByEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.findAllByEmpleado(id);
  }

  // PATCH /disponibilidad/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDisponibilidadDto,
  ) {
    return this.disponibilidadService.update(id, updateDto);
  }

  // DELETE /disponibilidad/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.disponibilidadService.remove(id);
  }
}
