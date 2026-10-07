/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  // --- MÉTODO CREATE (ACTUALIZADO) ---
  async create(createServicioDto: CreateServicioDto): Promise<Servicio> {
    // Separamos el parent_servicio_id del resto de los datos.
    const { parent_servicio_id, ...servicioData } = createServicioDto;
    
    const nuevoServicio = this.servicioRepository.create(servicioData);

    // Si se proporcionó un ID de padre, lo buscamos y lo asignamos.
    if (parent_servicio_id) {
      const parent = await this.findOne(parent_servicio_id);
      // findOne ya lanza un error 404 si el padre no existe.
      nuevoServicio.parentServicio = parent;
    }

    return this.servicioRepository.save(nuevoServicio);
  }

  async findAll(): Promise<Servicio[]> {
    // Para que la respuesta incluya la información del servicio padre,
    // añadimos la opción 'relations'.
    return this.servicioRepository.find({ relations: ['parentServicio'] });
  }

  async findOne(id: number): Promise<Servicio> {
    const servicio = await this.servicioRepository.findOne({
      where: { id },
      relations: ['parentServicio'], // También aquí para ver el detalle.
    });
    if (!servicio) {
      throw new NotFoundException(`El servicio con el ID #${id} no fue encontrado.`);
    }
    return servicio;
  }

  // --- MÉTODO UPDATE (ACTUALIZADO Y CORREGIDO) ---
  async update(id: number, updateServicioDto: UpdateServicioDto): Promise<Servicio> {
    const { parent_servicio_id, ...servicioData } = updateServicioDto;

    const servicio = await this.servicioRepository.preload({
      id: id,
      ...servicioData,
    });

    if (!servicio) {
      throw new NotFoundException(`El servicio con el ID #${id} no fue encontrado.`);
    }

    // Si se proporciona un ID de padre, lo buscamos y lo asignamos.
    if (parent_servicio_id) {
      const parent = await this.findOne(parent_servicio_id);
      servicio.parentServicio = parent;
    } else if (Object.prototype.hasOwnProperty.call(updateServicioDto, 'parent_servicio_id')) {
      // Esta es la forma segura de verificar si la propiedad existe en el DTO.
      // Nos permite quitar la relación enviando parent_servicio_id: null.
      servicio.parentServicio = null;
    }

    return this.servicioRepository.save(servicio);
  }

  async remove(id: number) {
    const servicio = await this.findOne(id);
    await this.servicioRepository.remove(servicio);
    return { message: `Servicio con ID #${id} eliminado correctamente.` };
  }
}
