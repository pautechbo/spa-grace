import { Test, TestingModule } from '@nestjs/testing';
import { AsistenciaService } from './asistencia.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

describe('AsistenciaService', () => {
  let service: AsistenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciaService,
        { provide: getRepositoryToken(Asistencia), useValue: {} },
        { provide: getRepositoryToken(Empleado), useValue: {} }
      ],
    }).compile();

    service = module.get<AsistenciaService>(AsistenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
