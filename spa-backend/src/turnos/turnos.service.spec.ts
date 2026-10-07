import { Test, TestingModule } from '@nestjs/testing';
import { TurnosService } from './turnos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Turno } from './entities/turno.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Disponibilidad } from 'src/disponibilidad/entities/disponibilidad.entity';

describe('TurnosService', () => {
  let service: TurnosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnosService,
        { provide: getRepositoryToken(Turno), useValue: {} },
        { provide: getRepositoryToken(Cobro), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Empleado), useValue: {} },
        { provide: getRepositoryToken(Servicio), useValue: {} },
        { provide: getRepositoryToken(Disponibilidad), useValue: {} }
      ],
    }).compile();

    service = module.get<TurnosService>(TurnosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
