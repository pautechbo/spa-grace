import { Test, TestingModule } from '@nestjs/testing';
import { CobrosController } from './cobros.controller';
import { CobrosService } from './cobros.service';

describe('CobrosController', () => {
  let controller: CobrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CobrosController],
      providers: [
        { provide: CobrosService, useValue: {} }
      ],
    }).compile();

    controller = module.get<CobrosController>(CobrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
