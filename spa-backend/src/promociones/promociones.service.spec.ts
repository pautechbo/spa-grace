import { Test, TestingModule } from '@nestjs/testing';
import { PromocionesService } from './promociones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Promocion } from './entities/promocion.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

describe('PromocionesService', () => {
  let service: PromocionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromocionesService,
        { provide: getRepositoryToken(Promocion), useValue: {} },
        { provide: getRepositoryToken(Servicio), useValue: {} }
      ],
    }).compile();

    service = module.get<PromocionesService>(PromocionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
