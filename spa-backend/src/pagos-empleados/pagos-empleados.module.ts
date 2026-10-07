import { Module } from '@nestjs/common';
import { PagosEmpleadosService } from './pagos-empleados.service';
import { PagosEmpleadosController } from './pagos-empleados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEmpleado } from './entities/pago-empleado.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PagoEmpleado, Empleado])],
  controllers: [PagosEmpleadosController],
  providers: [PagosEmpleadosService],
})
export class PagosEmpleadosModule {}
