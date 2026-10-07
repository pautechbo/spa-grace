import { Test, TestingModule } from '@nestjs/testing';
import { DisponibilidadService } from './disponibilidad.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

describe('DisponibilidadService', () => {
  let service: DisponibilidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisponibilidadService,
        { provide: getRepositoryToken(Disponibilidad), useValue: {} },
        { provide: getRepositoryToken(Empleado), useValue: {} }
      ],
    }).compile();

    service = module.get<DisponibilidadService>(DisponibilidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
