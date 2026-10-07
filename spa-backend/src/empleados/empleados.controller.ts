/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Patch, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoWithUserDto as CreateEmpleadoDto } from './dto/create-empleado-with-user.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AddServicioDto } from './dto/add-servicio.dto';


@Controller('empleados')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('admin') // Solo los administradores pueden acceder
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Get()
  findAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }

  @Put(':id/servicios')
  replaceServicios(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { serviciosIds: number[] },
  ) {
    return this.empleadosService.update(id, { serviciosIds: body.serviciosIds });
  }

  @Post(':id/servicios')
  addServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body() addServicioDto: AddServicioDto,
  ) {
    return this.empleadosService.addServicio(id, addServicioDto.id_servicio);
  }

}
