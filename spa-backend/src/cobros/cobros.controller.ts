/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { CreateCobroDto } from './dto/create-cobro.dto';
import { UpdateCobroDto } from './dto/update-cobro.dto';
import { AplicarDescuentoDto } from './dto/aplicar-descuento.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('cobros')
@UseGuards(JwtAuthGuard)
export class CobrosController {
  constructor(private readonly cobrosService: CobrosService) {}

  @Post()
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  create(@Body() createCobroDto: CreateCobroDto) {
    return this.cobrosService.create(createCobroDto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  findAll() {
    return this.cobrosService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.cobrosService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updateCobroDto: UpdateCobroDto) {
    return this.cobrosService.update(+id, updateCobroDto);
  }

  @Patch(':id/aplicar-descuento')
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  aplicarDescuento(
    @Param('id') id: string,
    @Body() aplicarDescuentoDto: AplicarDescuentoDto,
  ) {
    return this.cobrosService.aplicarDescuento(+id, aplicarDescuentoDto);
  }

  @Patch(':id/reembolsar')
  @Roles('admin', 'recepcionista')
  @UseGuards(RolesGuard)
  reembolsar(@Param('id') id: string) {
    return this.cobrosService.reembolsar(+id);
  }
}
