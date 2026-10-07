import { Module } from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { DisponibilidadController } from './disponibilidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Disponibilidad } from './entities/disponibilidad.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

@Module({
  // Importamos Disponibilidad y Empleado para que el servicio
  // pueda usar ambos repositorios.
  imports: [TypeOrmModule.forFeature([Disponibilidad, Empleado])],
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService],
})
export class DisponibilidadModule {}
