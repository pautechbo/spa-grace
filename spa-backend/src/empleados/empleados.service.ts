/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Servicio } from '../servicios/entities/servicio.entity';
import { UsersService } from '../users/users.service';
import { CreateEmpleadoWithUserDto } from './dto/create-empleado-with-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
// 1. Importar el enum UserRole
import { UserRole } from 'src/users/dto/create-user.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado) private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Servicio) private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Crea un nuevo Usuario y su perfil de Empleado asociado en una sola operación.
   */
  async create(createDto: CreateEmpleadoWithUserDto): Promise<Empleado> {
    const { usuario, especialidad, activo, serviciosIds } = createDto;

    const emailExists = await this.usersService.findByEmail(usuario.email);
    if (emailExists) throw new ConflictException('El correo electrónico ya está registrado.');
    if (usuario.username) {
      const usernameExists = await this.usersService.findByUsername(usuario.username);
      if (usernameExists) throw new ConflictException('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    
    // 2. Nos aseguramos de que el rol sea del tipo correcto
    const nuevoUsuario = await this.usersService.create({
      ...usuario,
      password: hashedPassword,
      rol: usuario.rol as UserRole, // Hacemos un 'cast' para asegurar el tipo
    });

    const nuevoEmpleado = this.empleadoRepository.create({
      usuario: nuevoUsuario,
      especialidad,
      activo,
    });
    
    if (serviciosIds && serviciosIds.length > 0) {
      const servicios = await this.servicioRepository.findBy({ id: In(serviciosIds) });
      nuevoEmpleado.servicios = servicios;
    }

    return this.empleadoRepository.save(nuevoEmpleado);
  }

  /**
   * Devuelve todos los empleados con sus relaciones.
   */
  findAll(): Promise<Empleado[]> {
    return this.empleadoRepository.find({ relations: ['usuario', 'servicios'] });
  }

  /**
   * Encuentra un empleado por su ID.
   */
  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({ where: { id }, relations: ['usuario', 'servicios'] });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID #${id} no encontrado.`);
    }
    return empleado;
  }

  /**
   * Asigna un servicio a un empleado.
   */
  async addServicio(idEmpleado: number, idServicio: number): Promise<Empleado> {
    const empleado = await this.findOne(idEmpleado);
    const servicio = await this.servicioRepository.findOneBy({ id: idServicio });

    if (!servicio) throw new NotFoundException(`Servicio con ID #${idServicio} no encontrado.`);

    const servicioYaAsignado = empleado.servicios.some(s => s.id === servicio.id);
    if (servicioYaAsignado) {
      throw new BadRequestException('El empleado ya tiene asignado este servicio.');
    }

    empleado.servicios.push(servicio);
    return this.empleadoRepository.save(empleado);
  }

  async update(id: number, updateDto: { especialidad?: string; activo?: any; serviciosIds?: number[] }): Promise<Empleado> {
    const empleado = await this.findOne(id);

    if (updateDto.especialidad !== undefined) empleado.especialidad = updateDto.especialidad;
    if (updateDto.activo !== undefined) empleado.activo = !!updateDto.activo;

    if (updateDto.serviciosIds !== undefined) {
      const servicios = await this.servicioRepository.findBy({ id: In(updateDto.serviciosIds) });
      empleado.servicios = servicios;
    }

    return this.empleadoRepository.save(empleado);
  }

  async replaceServicios(id: number, serviciosIds: number[]): Promise<Empleado> {
    return this.update(id, { serviciosIds });
  }
}

