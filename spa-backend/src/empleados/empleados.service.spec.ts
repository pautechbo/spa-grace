import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from './empleados.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

describe('EmpleadosService', () => {
  let service: EmpleadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadosService,
        { provide: getRepositoryToken(Empleado), useValue: {} },
        { provide: getRepositoryToken(Servicio), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: UsersService, useValue: {} }
      ],
    }).compile();

    service = module.get<EmpleadosService>(EmpleadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
