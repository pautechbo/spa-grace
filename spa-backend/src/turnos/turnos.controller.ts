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
  Query,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() createTurnoDto: CreateTurnoDto) {
    return this.turnosService.create(createTurnoDto);
  }

  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('empleado_id') empleado_id?: string,
    @Query('cliente_id') cliente_id?: string,
  ) {
    return this.turnosService.findAll(estado, empleado_id ? +empleado_id : undefined, cliente_id ? +cliente_id : undefined);
  }

  @Get('count-by-cliente')
  countByCliente() {
    return this.turnosService.countByCliente();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'recepcionista')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTurnoDto: UpdateTurnoDto,
  ) {
    return this.turnosService.update(id, updateTurnoDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'recepcionista')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.remove(id);
  }

  @Patch(':id/atender')
  marcarAtendido(@Param('id', ParseIntPipe) id: number) {
    return this.turnosService.marcarAtendido(id);
  }
}
