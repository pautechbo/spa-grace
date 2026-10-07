import { Test, TestingModule } from '@nestjs/testing';
import { HistorialesService } from './historiales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistorialClinico } from './entities/historial.entity';
import { User } from 'src/users/entities/user.entity';
import { Turno } from 'src/turnos/entities/turno.entity';

describe('HistorialesService', () => {
  let service: HistorialesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialesService,
        { provide: getRepositoryToken(HistorialClinico), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Turno), useValue: {} }
      ],
    }).compile();

    service = module.get<HistorialesService>(HistorialesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
