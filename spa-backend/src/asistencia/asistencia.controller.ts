import { Controller, Post, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post('entrada/:id')
  @Roles('admin', 'recepcionista', 'terapeuta')
  marcarEntrada(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.marcarEntrada(id);
  }

  @Post('salida/:id')
  @Roles('admin', 'recepcionista', 'terapeuta')
  marcarSalida(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciaService.marcarSalida(id);
  }

  @Get('empleado/:id')
  @Roles('admin', 'recepcionista')
  getAsistencias(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.asistenciaService.getAsistencias(id, fechaInicio, fechaFin);
  }
}
