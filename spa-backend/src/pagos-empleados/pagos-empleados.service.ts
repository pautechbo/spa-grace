/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagoEmpleado } from './entities/pago-empleado.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { CreatePagoEmpleadoDto } from './dto/create-pago-empleado.dto';
import { UpdatePagoEmpleadoDto } from './dto/update-pago-empleado.dto';

@Injectable()
export class PagosEmpleadosService {
  constructor(
    @InjectRepository(PagoEmpleado)
    private readonly pagoRepository: Repository<PagoEmpleado>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  // --- Método para CREAR un nuevo registro de pago ---
  async create(createDto: CreatePagoEmpleadoDto): Promise<PagoEmpleado> {
    const { id_empleado, ...pagoData } = createDto;

    // 1. Validar que el empleado exista.
    const empleado = await this.empleadoRepository.findOne({ where: { id: id_empleado } });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID #${id_empleado} no encontrado.`);
    }

    // 2. Crear y guardar el nuevo registro de pago.
    const nuevoPago = this.pagoRepository.create({
      ...pagoData,
      empleado,
    });

    return this.pagoRepository.save(nuevoPago);
  }

  // --- Método para OBTENER TODOS los pagos ---
  async findAll(): Promise<PagoEmpleado[]> {
    return this.pagoRepository.find({ relations: ['empleado'] });
  }

  // --- Método para OBTENER UN pago por su ID ---
  async findOne(id: number): Promise<PagoEmpleado> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: ['empleado'],
    });
    if (!pago) {
      throw new NotFoundException(`Registro de pago con ID #${id} no encontrado.`);
    }
    return pago;
  }
  
  // --- Método para OBTENER TODOS los pagos de un empleado específico ---
  async findAllByEmpleado(idEmpleado: number): Promise<PagoEmpleado[]> {
    return this.pagoRepository.find({
      where: { empleado: { id: idEmpleado } },
      order: { fecha_pago: 'DESC' },
    });
  }

  // --- Método para ACTUALIZAR un pago ---
  async update(id: number, updateDto: UpdatePagoEmpleadoDto): Promise<PagoEmpleado> {
    const pago = await this.pagoRepository.preload({
      id,
      ...updateDto,
    });
    if (!pago) {
      throw new NotFoundException(`Registro de pago con ID #${id} no encontrado.`);
    }
    return this.pagoRepository.save(pago);
  }

  // --- Método para ELIMINAR un pago ---
  async remove(id: number) {
    const pago = await this.findOne(id); // findOne ya valida si existe
    await this.pagoRepository.remove(pago);
    return { message: `Registro de pago con ID #${id} eliminado correctamente.` };
  }
}
