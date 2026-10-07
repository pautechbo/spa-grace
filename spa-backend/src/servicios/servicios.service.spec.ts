import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from './servicios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';

describe('ServiciosService', () => {
  let service: ServiciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        { provide: getRepositoryToken(Servicio), useValue: {} }
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
