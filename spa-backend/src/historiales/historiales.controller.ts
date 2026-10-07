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
import { HistorialesService } from './historiales.service';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('historiales')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('admin', 'recepcionista', 'terapeuta') // Solo el personal puede gestionar historiales
export class HistorialesController {
  constructor(private readonly historialesService: HistorialesService) {}

  // POST /historiales
  @Post()
  create(@Body() createHistorialDto: CreateHistorialDto) {
    return this.historialesService.create(createHistorialDto);
  }

  @Get()
  findAll() {
    return this.historialesService.findAll();
  }

  @Get('cliente/:id')
  findByCliente(@Param('id', ParseIntPipe) id: number) {
    return this.historialesService.findByCliente(id);
  }

  // GET /historiales/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialesService.findOne(id);
  }

  // PATCH /historiales/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistorialDto: UpdateHistorialDto,
  ) {
    return this.historialesService.update(id, updateHistorialDto);
  }

  // DELETE /historiales/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialesService.remove(id);
  }
}
