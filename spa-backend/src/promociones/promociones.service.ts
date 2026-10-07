/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promocion)
    private readonly promocionRepository: Repository<Promocion>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  // --- Método para CREAR una nueva promoción (ACTUALIZADO) ---
  async create(
    createPromocionDto: CreatePromocionDto,
    user: User, // Recibimos el usuario que está realizando la acción
  ): Promise<Promocion> {
    const { id_servicio_aplicable, ...promocionData } = createPromocionDto;

    const nuevaPromocion = this.promocionRepository.create({
      ...promocionData,
      creadoPor: user, // Asignamos el usuario a la promoción
    });

    // Si la promoción aplica a un servicio específico, lo validamos y asignamos.
    if (id_servicio_aplicable) {
      const servicio = await this.servicioRepository.findOne({
        where: { id: id_servicio_aplicable },
      });
      if (!servicio) {
        throw new NotFoundException(
          `Servicio con ID #${id_servicio_aplicable} no encontrado.`,
        );
      }
      nuevaPromocion.servicioAplicable = servicio;
    }

    return this.promocionRepository.save(nuevaPromocion);
  }

  // --- Método para OBTENER TODAS las promociones ---
  async findAll(): Promise<Promocion[]> {
    // Incluimos la relación 'creadoPor' para ver quién la creó.
    return this.promocionRepository.find({
      relations: ['servicioAplicable', 'creadoPor'],
    });
  }

  // --- Método para OBTENER UNA promoción por su ID ---
  async findOne(id: number): Promise<Promocion> {
    const promocion = await this.promocionRepository.findOne({
      where: { id },
      relations: ['servicioAplicable', 'creadoPor'],
    });
    if (!promocion) {
      throw new NotFoundException(`Promoción con ID #${id} no encontrada.`);
    }
    return promocion;
  }

  // --- Método para ACTUALIZAR una promoción ---
  async update(
    id: number,
    updatePromocionDto: UpdatePromocionDto,
  ): Promise<Promocion> {
    const { id_servicio_aplicable, ...promocionData } = updatePromocionDto;

    const promocion = await this.promocionRepository.preload({
      id,
      ...promocionData,
    });

    if (!promocion) {
      throw new NotFoundException(`Promoción con ID #${id} no encontrada.`);
    }

    // Si se está actualizando el servicio aplicable, lo validamos y lo asignamos.
    if (id_servicio_aplicable) {
      const servicio = await this.servicioRepository.findOne({
        where: { id: id_servicio_aplicable },
      });
      if (!servicio) {
        throw new NotFoundException(
          `Servicio con ID #${id_servicio_aplicable} no encontrado.`,
        );
      }
      promocion.servicioAplicable = servicio;
    }

    return this.promocionRepository.save(promocion);
  }

  // --- Método para ELIMINAR una promoción ---
  async remove(id: number) {
    const promocion = await this.findOne(id); // findOne ya valida si existe
    await this.promocionRepository.remove(promocion);
    return { message: `Promoción con ID #${id} eliminada correctamente.` };
  }
}
