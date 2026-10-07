import { Test, TestingModule } from '@nestjs/testing';
import { CobrosService } from './cobros.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cobro } from './entities/cobro.entity';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Promocion } from 'src/promociones/entities/promocion.entity';

describe('CobrosService', () => {
  let service: CobrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CobrosService,
        { provide: getRepositoryToken(Cobro), useValue: {} },
        { provide: getRepositoryToken(Turno), useValue: {} },
        { provide: getRepositoryToken(Promocion), useValue: {} }
      ],
    }).compile();

    service = module.get<CobrosService>(CobrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
