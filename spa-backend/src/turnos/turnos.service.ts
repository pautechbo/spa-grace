/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { Turno } from './entities/turno.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Disponibilidad } from 'src/disponibilidad/entities/disponibilidad.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Cobro)
    private readonly cobroRepository: Repository<Cobro>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Disponibilidad)
    private readonly disponibilidadRepository: Repository<Disponibilidad>,
  ) {}

  async create(createTurnoDto: CreateTurnoDto): Promise<Turno> {
    const { id_cliente, id_empleado, id_servicios, fecha, hora } = createTurnoDto;

    // --- VALIDACIONES EXISTENTES ---
    const cliente = await this.userRepository.findOneBy({ id: id_cliente });
    if (!cliente) throw new NotFoundException(`Cliente con ID #${id_cliente} no encontrado`);
    if (cliente.rol !== 'cliente') throw new BadRequestException(`El usuario con ID #${id_cliente} no es un cliente.`);

    const servicios = await this.servicioRepository.findBy({ id: In(id_servicios) });
    if (servicios.length !== id_servicios.length) {
      throw new NotFoundException('Uno o más servicios no fueron encontrados.');
    }

    const empleado = await this.empleadoRepository.findOne({ where: { id: id_empleado }, relations: ['servicios'] });
    if (!empleado) throw new NotFoundException(`Empleado con ID #${id_empleado} no encontrado.`);

    if (empleado.servicios && empleado.servicios.length > 0) {
      const empleadoServiceIds = new Set(empleado.servicios.map(s => s.id));
      const puedeRealizarTodos = id_servicios.every(id => empleadoServiceIds.has(id));
      if (!puedeRealizarTodos) {
        const serviciosFaltantes = id_servicios.filter(id => !empleadoServiceIds.has(id));
        throw new BadRequestException(
          `El empleado no está autorizado para los servicios IDs: ${serviciosFaltantes.join(', ')}. Servicios del empleado: ${Array.from(empleadoServiceIds).join(', ')}`
        );
      }
    }

    const existingTurno = await this.turnoRepository.createQueryBuilder('turno').where('turno.empleado = :id_empleado', { id_empleado }).andWhere('turno.fecha = :fecha', { fecha }).andWhere('turno.hora = :hora', { hora }).getOne();
    if (existingTurno) throw new ConflictException(`El empleado ya tiene un turno agendado en ese horario.`);

    // --- NUEVA VALIDACIÓN DE DISPONIBILIDAD DE HORARIO ---
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaTurno = dias[new Date(fecha).getDay()];

    const disponibilidadEmpleado = await this.disponibilidadRepository.findOne({
        where: {
            empleado: { id: id_empleado },
            dia_semana: diaSemanaTurno,
            activo: true,
        }
    });

    if (!disponibilidadEmpleado) {
        throw new BadRequestException(`El empleado no trabaja el día ${diaSemanaTurno}.`);
    }

    if (hora < disponibilidadEmpleado.hora_inicio || hora >= disponibilidadEmpleado.hora_fin) {
        throw new BadRequestException(`El horario solicitado está fuera del horario laboral del empleado (${disponibilidadEmpleado.hora_inicio} - ${disponibilidadEmpleado.hora_fin}).`);
    }
    // --- FIN DE LA NUEVA VALIDACIÓN ---

    const precioTotalPaquete = servicios.reduce((total, servicio) => total + Number(servicio.precio), 0);
    const nuevoTurno = this.turnoRepository.create({
      ...createTurnoDto,
      fecha,
      hora,
      cliente,
      empleado,
      servicios,
      precio_servicio_base: precioTotalPaquete,
      //duracion_final: servicio.duracion,
    });

    const turnoGuardado = await this.turnoRepository.save(nuevoTurno);

    // 3. Crear automáticamente el registro de cobro asociado
    const nuevoCobro = this.cobroRepository.create({
      turno: turnoGuardado,
      monto_total: precioTotalPaquete,
      estado_pago: 'pendiente_adelanto'
    });
    await this.cobroRepository.save(nuevoCobro);

    // 4. Devolver el turno completo con su cobro recién creado
    return this.findOne(turnoGuardado.id);
  }

  async findAll(estado?: string, empleado_id?: number, cliente_id?: number): Promise<Turno[]> {
    const where: any = {};
    if (estado) where.estado = estado;
    if (empleado_id) where.empleado = { id: empleado_id };
    if (cliente_id) where.cliente = { id: cliente_id };

    return this.turnoRepository.find({
      where,
      relations: ['cliente', 'servicios', 'empleado', 'empleado.usuario', 'cobros'],
      order: { fecha: 'ASC', hora: 'ASC' },
    });
  }

  async countByCliente(): Promise<{ id_cliente: number; nombre: string; cantidad: number }[]> {
    const result = await this.turnoRepository
      .createQueryBuilder('turno')
      .leftJoin('turno.cliente', 'cliente')
      .select('cliente.id', 'id_cliente')
      .addSelect('cliente.nombre', 'nombre')
      .addSelect('COUNT(turno.id)', 'cantidad')
      .groupBy('cliente.id')
      .orderBy('cantidad', 'DESC')
      .getRawMany();

    return result.map(r => ({
      id_cliente: Number(r.id_cliente),
      nombre: r.nombre,
      cantidad: Number(r.cantidad),
    }));
  }

  async findOne(id: number): Promise<Turno> {
    const turno = await this.turnoRepository.findOne({
      where: { id },
      // CORRECCIÓN: También aquí para el detalle de un solo turno
      relations: ['cliente', 'empleado', 'empleado.usuario', 'servicios', 'cobros'],
    });
    if (!turno) throw new NotFoundException(`Turno con ID #${id} no encontrado.`);
    return turno;
  }

  async update(id: number, updateTurnoDto: UpdateTurnoDto): Promise<Turno> {
    const turno = await this.findOne(id);
    const { id_cliente, id_empleado, id_servicios, ...restOfDto } = updateTurnoDto;

    if (id_cliente) {
      const cliente = await this.userRepository.findOne({ where: { id: id_cliente } });
      if (!cliente) throw new NotFoundException(`Cliente con ID #${id_cliente} no encontrado.`);
      if (cliente.rol !== 'cliente') throw new BadRequestException(`El usuario con ID #${id_cliente} no es un cliente.`);
      turno.cliente = cliente;
    }
    if (id_empleado) {
      const empleado = await this.empleadoRepository.findOne({ where: { id: id_empleado } });
      if (!empleado) throw new NotFoundException(`Empleado con ID #${id_empleado} no encontrado.`);
      turno.empleado = empleado;
    }
    if (id_servicios) {
      const servicios = await this.servicioRepository.findBy({ id: In(id_servicios) });
      if (!servicios || servicios.length !== id_servicios.length) {
        throw new NotFoundException(`Uno o más servicios con los IDs proporcionados no fueron encontrados.`);
      }
      turno.precio_servicio_base = servicios.reduce((total, servicio) => total + Number(servicio.precio), 0);
    }
    Object.assign(turno, restOfDto);
    return this.turnoRepository.save(turno);
  }

  async marcarAtendido(id: number): Promise<Turno> {
    const turno = await this.findOne(id);
    if (turno.estado !== 'confirmado' && turno.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden marcar como atendidos los turnos confirmados o pendientes.');
    }
    turno.estado = 'atendido';
    turno.atendido_exitoso = new Date();
    return this.turnoRepository.save(turno);
  }

  async remove(id: number) {
    const turno = await this.findOne(id);
    await this.turnoRepository.remove(turno);
    return { message: `Turno con ID #${id} eliminado correctamente.` };
  }
}
