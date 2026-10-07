import { Test, TestingModule } from '@nestjs/testing';
import { PagosEmpleadosController } from './pagos-empleados.controller';
import { PagosEmpleadosService } from './pagos-empleados.service';

describe('PagosEmpleadosController', () => {
  let controller: PagosEmpleadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosEmpleadosController],
      providers: [
        { provide: PagosEmpleadosService, useValue: {} }
      ],
    }).compile();

    controller = module.get<PagosEmpleadosController>(PagosEmpleadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
