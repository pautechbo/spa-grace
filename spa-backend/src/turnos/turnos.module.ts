import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from './entities/turno.entity';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Disponibilidad } from 'src/disponibilidad/entities/disponibilidad.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';

@Module({
  // Para que TurnosService pueda verificar que los clientes, empleados y
  // servicios existen, necesitamos darle acceso a sus repositorios.
  // Lo hacemos importando sus entidades aquí.
  imports: [
    TypeOrmModule.forFeature([
      Turno,
      User,
      Empleado,
      Servicio,
      Disponibilidad,
      Cobro,
    ]),
  ],
  controllers: [TurnosController],
  providers: [TurnosService],
})
export class TurnosModule {}
