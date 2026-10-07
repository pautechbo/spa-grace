import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async marcarEntrada(idEmpleado: number): Promise<Asistencia> {
    const empleado = await this.empleadoRepository.findOne({ where: { id: idEmpleado } });
    if (!empleado) throw new NotFoundException(`Empleado con ID #${idEmpleado} no encontrado.`);

    const hoy = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const existente = await this.asistenciaRepository.findOne({ where: { empleado: { id: idEmpleado }, fecha: hoy } });
    if (existente) throw new NotFoundException('Ya registraste entrada hoy.');

    const nueva = this.asistenciaRepository.create({ empleado, fecha: hoy, hora_entrada: hora });
    return this.asistenciaRepository.save(nueva);
  }

  async marcarSalida(idEmpleado: number): Promise<Asistencia> {
    const hoy = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const registro = await this.asistenciaRepository.findOne({ where: { empleado: { id: idEmpleado }, fecha: hoy } });
    if (!registro) throw new NotFoundException('No registraste entrada hoy.');
    if (registro.hora_salida) throw new NotFoundException('Ya registraste salida hoy.');

    registro.hora_salida = hora;
    return this.asistenciaRepository.save(registro);
  }

  async getAsistencias(idEmpleado: number, fechaInicio?: string, fechaFin?: string): Promise<Asistencia[]> {
    const where: any = { empleado: { id: idEmpleado } };
    if (fechaInicio && fechaFin) where.fecha = Between(fechaInicio, fechaFin);
    return this.asistenciaRepository.find({ where, order: { fecha: 'DESC' } });
  }
}
