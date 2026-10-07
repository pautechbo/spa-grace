/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialClinico } from './entities/historial.entity';
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';
import { User } from 'src/users/entities/user.entity';
import { Turno } from 'src/turnos/entities/turno.entity';

@Injectable()
export class HistorialesService {
  constructor(
    @InjectRepository(HistorialClinico)
    private readonly historialRepository: Repository<HistorialClinico>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
  ) {}

  // --- Método para CREAR una nueva entrada en el historial ---
  async create(createHistorialDto: CreateHistorialDto): Promise<HistorialClinico> {
    const { id_cliente, id_turno, ...historialData } = createHistorialDto;

    // 1. Validar que el cliente exista.
    const cliente = await this.userRepository.findOne({ where: { id: id_cliente } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID #${id_cliente} no encontrado.`);
    }

    const nuevaEntrada = this.historialRepository.create({
      ...historialData,
      cliente,
    });

    // 2. Si se proporciona un ID de turno, validarlo y asignarlo.
    if (id_turno) {
      const turno = await this.turnoRepository.findOne({ where: { id: id_turno } });
      if (!turno) {
        throw new NotFoundException(`Turno con ID #${id_turno} no encontrado.`);
      }
      nuevaEntrada.turno = turno;
    }

    return this.historialRepository.save(nuevaEntrada);
  }

  // --- Método para OBTENER TODOS los historiales ---
  async findAll(): Promise<HistorialClinico[]> {
    return this.historialRepository.find({ relations: ['cliente', 'turno'] });
  }

  // --- Método para OBTENER UN historial por su ID ---
  async findOne(id: number): Promise<HistorialClinico> {
    const historial = await this.historialRepository.findOne({
      where: { id },
      relations: ['cliente', 'turno'],
    });
    if (!historial) {
      throw new NotFoundException(`Entrada de historial con ID #${id} no encontrada.`);
    }
    return historial;
  }

  async findByCliente(id_cliente: number): Promise<HistorialClinico[]> {
    return this.historialRepository.find({
      where: { cliente: { id: id_cliente } },
      relations: ['cliente', 'turno'],
      order: { fecha: 'DESC' },
    });
  }

  // --- Método para ACTUALIZAR un historial ---
  async update(id: number, updateHistorialDto: UpdateHistorialDto): Promise<HistorialClinico> {
    const historial = await this.historialRepository.preload({
      id: id,
      ...updateHistorialDto,
    });
    if (!historial) {
      throw new NotFoundException(`Entrada de historial con ID #${id} no encontrada.`);
    }
    return this.historialRepository.save(historial);
  }

  // --- Método para ELIMINAR un historial ---
  async remove(id: number) {
    const historial = await this.findOne(id); // findOne ya valida si existe
    await this.historialRepository.remove(historial);
    return { message: `Entrada de historial con ID #${id} eliminada correctamente.` };
  }
}
