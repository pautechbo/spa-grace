/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cobro } from './entities/cobro.entity';
import { CreateCobroDto } from './dto/create-cobro.dto';
import { AplicarDescuentoDto } from './dto/aplicar-descuento.dto';


import { Turno } from 'src/turnos/entities/turno.entity';
import { Promocion } from 'src/promociones/entities/promocion.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { UpdateCobroDto } from './dto/update-cobro.dto';

@Injectable()
export class CobrosService {
  constructor(
    @InjectRepository(Cobro)
    private readonly cobroRepository: Repository<Cobro>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Promocion)
    private readonly promocionRepository: Repository<Promocion>,
  ) {}

  async create(createCobroDto: CreateCobroDto): Promise<Cobro> {
    const { id_turno, monto_total } = createCobroDto;
    const turno = await this.turnoRepository.findOne({
      where: { id: id_turno },
    });
    if (!turno) {
      throw new NotFoundException(`Turno con ID #${id_turno} no encontrado.`);
    }
    const cobroExistente = await this.cobroRepository.findOne({
      where: { turno: { id: id_turno } },
    });
    if (cobroExistente) {
      throw new BadRequestException(
        `Ya existe un registro de cobro para el turno con ID #${id_turno}.`,
      );
    }
    const nuevoCobro = this.cobroRepository.create({
      turno,
      monto_total,
    });
    return this.cobroRepository.save(nuevoCobro);
  }

  async findAll(): Promise<Cobro[]> {
    return this.cobroRepository.find({ relations: ['turno'] });
  }

  async findOne(id: number): Promise<Cobro> {
    const cobro = await this.cobroRepository.findOne({
      where: { id },
      relations: ['turno', 'turno.servicios'],
    });
    if (!cobro) {
      throw new NotFoundException(`Cobro con ID #${id} no encontrado.`);
    }
    return cobro;
  }

async update(id: number, updateCobroDto: UpdateCobroDto): Promise<Cobro> {
    const cobro = await this.cobroRepository.findOneBy({ id });
    if (!cobro) {
      throw new NotFoundException(`Cobro con ID #${id} no encontrado.`);
    }

    // Fusionamos los datos del DTO en la entidad existente.
    Object.assign(cobro, updateCobroDto);

    // Añadimos lógica de negocio específica
    if (updateCobroDto.monto_adelanto && !cobro.fecha_adelanto) {
      cobro.fecha_adelanto = new Date();
    }

    if (updateCobroDto.estado_pago === 'pagado_completo' && !cobro.fecha_cobro_final) {
      cobro.fecha_cobro_final = new Date();
    }

    return this.cobroRepository.save(cobro);
  }

  // --- NUEVO MÉTODO PARA APLICAR DESCUENTOS ---
  async aplicarDescuento(id: number, aplicarDescuentoDto: AplicarDescuentoDto): Promise<Cobro> {
    const { codigo_descuento } = aplicarDescuentoDto;

    const cobro = await this.cobroRepository.findOne({ where: { id }, relations: ['turno', 'turno.servicios'] });
    if (!cobro) {
      throw new NotFoundException(`Cobro con ID #${id} no encontrado.`);
    }

    const promocion = await this.promocionRepository.findOne({ where: { codigo_descuento, activo: true }, relations: ['servicioAplicable'] });
    if (!promocion) {
      throw new NotFoundException(`Código de descuento "${codigo_descuento}" no encontrado o no está activo.`);
    }

    if (promocion.aplica_a === 'servicio_especifico' && promocion.servicioAplicable) {
      // --- CORRECCIÓN DE TIPO ---
      // Tipamos 's' explícitamente como 'Servicio'
      const isServiceInTurno = cobro.turno.servicios.some((s: Servicio) => s.id === promocion.servicioAplicable.id);
      if (!isServiceInTurno) {
        throw new BadRequestException('Este código de descuento no es válido para los servicios de este turno.');
      }
    }

    let montoDescuento = 0;
    if (promocion.tipo_descuento === 'porcentaje') {
      montoDescuento = (cobro.monto_total * promocion.valor_descuento) / 100;
    } else if (promocion.tipo_descuento === 'fijo') {
      montoDescuento = promocion.valor_descuento;
    }

    cobro.monto_total = Math.max(0, cobro.monto_total - montoDescuento);
    cobro.notas = `Descuento de ${promocion.titulo} aplicado.`;

    return this.cobroRepository.save(cobro);
  }
  // --- NUEVO MÉTODO PARA REEMBOLSOS ---
  async reembolsar(id: number): Promise<Cobro> {
    const cobro = await this.cobroRepository.findOneBy({ id });
    if (!cobro) {
      throw new NotFoundException(`Cobro con ID #${id} no encontrado.`);
    }

    if (cobro.monto_adelanto <= 0) {
      throw new BadRequestException('No se puede reembolsar un turno sin adelanto.');
    }

    if (cobro.estado_pago !== 'adelanto_pagado') {
      throw new BadRequestException(`Solo se pueden reembolsar cobros con estado "adelanto pagado".`);
    }

    cobro.estado_pago = 'reembolsado';
    cobro.notas = `Adelanto de ${cobro.monto_adelanto} reembolsado.`;

    return this.cobroRepository.save(cobro);
  }
}