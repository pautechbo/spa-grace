/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';

@Injectable()
export class DisponibilidadService {
  constructor(
    @InjectRepository(Disponibilidad)
    private readonly disponibilidadRepository: Repository<Disponibilidad>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  // --- Método para CREAR un nuevo bloque de horario ---
  async create(createDto: CreateDisponibilidadDto): Promise<Disponibilidad> {
    const { id_empleado, dia_semana, hora_inicio, hora_fin } = createDto;

    // 1. Validar que el empleado exista.
    const empleado = await this.empleadoRepository.findOne({ where: { id: id_empleado } });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID #${id_empleado} no encontrado.`);
    }
    
    // 2. Validar que la hora de fin sea posterior a la hora de inicio.
    if (hora_inicio >= hora_fin) {
        throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio.');
    }

    // 3. Crear y guardar el nuevo bloque de disponibilidad.
    const nuevaDisponibilidad = this.disponibilidadRepository.create({
      empleado,
      dia_semana,
      hora_inicio,
      hora_fin,
    });

    return this.disponibilidadRepository.save(nuevaDisponibilidad);
  }

  // --- Método para OBTENER TODOS los horarios de un empleado ---
  async findAllByEmpleado(idEmpleado: number): Promise<Disponibilidad[]> {
    return this.disponibilidadRepository.find({
      where: { empleado: { id: idEmpleado } },
      order: { dia_semana: 'ASC' }, // Opcional: ordenar por día
    });
  }

  // --- Método para ACTUALIZAR un bloque de horario ---
  async update(id: number, updateDto: UpdateDisponibilidadDto): Promise<Disponibilidad> {
    const disponibilidad = await this.disponibilidadRepository.preload({
      id,
      ...updateDto,
    });
    if (!disponibilidad) {
      throw new NotFoundException(`Bloque de horario con ID #${id} no encontrado.`);
    }
    return this.disponibilidadRepository.save(disponibilidad);
  }

  async replaceAll(idEmpleado: number, horarios: { dia_semana: string; hora_inicio: string; hora_fin: string }[]): Promise<Disponibilidad[]> {
    const empleado = await this.empleadoRepository.findOne({ where: { id: idEmpleado } });
    if (!empleado) throw new NotFoundException(`Empleado con ID #${idEmpleado} no encontrado.`);

    await this.disponibilidadRepository.delete({ empleado: { id: idEmpleado } });

    const nuevos = horarios.map(h => this.disponibilidadRepository.create({ empleado, ...h }));
    return this.disponibilidadRepository.save(nuevos);
  }

  // --- Método para ELIMINAR un bloque de horario ---
  async remove(id: number) {
    const disponibilidad = await this.disponibilidadRepository.findOne({ where: { id } });
    if (!disponibilidad) {
      throw new NotFoundException(`Bloque de horario con ID #${id} no encontrado.`);
    }
    await this.disponibilidadRepository.remove(disponibilidad);
    return { message: `Bloque de horario con ID #${id} eliminado correctamente.` };
  }
}
