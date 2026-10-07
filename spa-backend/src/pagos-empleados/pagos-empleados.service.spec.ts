import { Test, TestingModule } from '@nestjs/testing';
import { PagosEmpleadosService } from './pagos-empleados.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagoEmpleado } from './entities/pago-empleado.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

describe('PagosEmpleadosService', () => {
  let service: PagosEmpleadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosEmpleadosService,
        { provide: getRepositoryToken(PagoEmpleado), useValue: {} },
        { provide: getRepositoryToken(Empleado), useValue: {} }
      ],
    }).compile();

    service = module.get<PagosEmpleadosService>(PagosEmpleadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
