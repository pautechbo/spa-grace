import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { UserRole } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async register(registerDto: RegisterAuthDto) {
    const { email, password } = registerDto;

    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      rol: UserRole.CLIENTE,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(loginDto: LoginAuthDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    let id_empleado: number | undefined;
    if (user.rol === 'terapeuta' || user.rol === 'recepcionista' || user.rol === 'admin') {
      const emp = await this.empleadoRepository.findOne({ where: { usuario: { id: user.id } } });
      if (emp) id_empleado = emp.id;
    }

    const { password, ...userObject } = user;
    const userWithEmpleadoId = { ...userObject, id_empleado };

    const payload = { sub: user.id, username: user.username, rol: user.rol };
    return {
      accessToken: this.jwtService.sign(payload),
      user: userWithEmpleadoId,
    };
  }

  async getProfile(user: User) {
    let id_empleado: number | undefined;
    if (user.rol === 'terapeuta' || user.rol === 'recepcionista' || user.rol === 'admin') {
      const emp = await this.empleadoRepository.findOne({ where: { usuario: { id: user.id } } });
      if (emp) id_empleado = emp.id;
    }
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, id_empleado };
  }
}
