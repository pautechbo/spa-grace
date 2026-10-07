/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

// El prefijo '/servicios' se aplicará a todas las rutas de este controlador.
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  // --- Endpoint para CREAR un servicio (Protegido) ---
  // Solo los usuarios autenticados podrán crear servicios.
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  // --- Endpoint para OBTENER TODOS los servicios (Público) ---
  // Esta ruta es pública para que cualquiera pueda ver el catálogo de servicios.
  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  // --- Endpoint para OBTENER UN servicio por ID (Público) ---
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe convierte el 'id' de la URL (que es un string) a un número.
    // Si no es un número válido, devuelve un error 400 Bad Request.
    return this.serviciosService.findOne(id);
  }

  // --- Endpoint para ACTUALIZAR un servicio (Protegido) ---
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServicioDto: UpdateServicioDto,
  ) {
    return this.serviciosService.update(id, updateServicioDto);
  }

  // --- Endpoint para ELIMINAR un servicio (Protegido) ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviciosService.remove(id);
  }
}
