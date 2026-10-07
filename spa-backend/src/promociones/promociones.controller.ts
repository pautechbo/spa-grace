/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  Req,
} from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Request } from 'express';

@Controller('promociones')
@UseGuards(JwtAuthGuard, RolesGuard) // Protegemos todo el controlador
@Roles('admin', 'recepcionista') // Solo admin y recepcionista pueden gestionar promociones
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  // POST /promociones
  @Post()
  create(
    @Body() createPromocionDto: CreatePromocionDto,
    @Req() req: Request, // Inyectamos el objeto de la petición
  ) {
    // El objeto 'user' fue añadido a la petición por nuestro JwtAuthGuard.
    // Se lo pasamos al servicio para que sepa quién está creando la promoción.
    return this.promocionesService.create(createPromocionDto, req.user as any);
  }

  // GET /promociones
  @Get()
  findAll() {
    return this.promocionesService.findAll();
  }

  // GET /promociones/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.findOne(id);
  }

  // PATCH /promociones/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromocionDto: UpdatePromocionDto,
  ) {
    return this.promocionesService.update(id, updatePromocionDto);
  }

  // DELETE /promociones/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.remove(id);
  }
}
