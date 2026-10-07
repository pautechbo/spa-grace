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
import { PagosEmpleadosService } from './pagos-empleados.service';
import { CreatePagoEmpleadoDto } from './dto/create-pago-empleado.dto';
import { UpdatePagoEmpleadoDto } from './dto/update-pago-empleado.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('pagos-empleados')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('admin') // Solo los administradores pueden gestionar la nómina
export class PagosEmpleadosController {
  constructor(
    private readonly pagosEmpleadosService: PagosEmpleadosService,
  ) {}

  // POST /pagos-empleados
  @Post()
  create(@Body() createDto: CreatePagoEmpleadoDto) {
    return this.pagosEmpleadosService.create(createDto);
  }

  // GET /pagos-empleados
  @Get()
  findAll() {
    return this.pagosEmpleadosService.findAll();
  }

  // GET /pagos-empleados/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosEmpleadosService.findOne(id);
  }

  // GET /pagos-empleados/empleado/:id
  @Get('empleado/:id')
  findAllByEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.pagosEmpleadosService.findAllByEmpleado(id);
  }

  // PATCH /pagos-empleados/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePagoEmpleadoDto,
  ) {
    return this.pagosEmpleadosService.update(id, updateDto);
  }

  // DELETE /pagos-empleados/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagosEmpleadosService.remove(id);
  }
}
