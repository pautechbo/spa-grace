import { Test, TestingModule } from '@nestjs/testing';
import { HistorialesController } from './historiales.controller';
import { HistorialesService } from './historiales.service';

describe('HistorialesController', () => {
  let controller: HistorialesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialesController],
      providers: [
        { provide: HistorialesService, useValue: {} }
      ],
    }).compile();

    controller = module.get<HistorialesController>(HistorialesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
