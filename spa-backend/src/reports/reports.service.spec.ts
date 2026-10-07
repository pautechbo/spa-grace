import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Turno), useValue: {} },
        { provide: getRepositoryToken(Cobro), useValue: {} },
        { provide: getRepositoryToken(Servicio), useValue: {} }
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
