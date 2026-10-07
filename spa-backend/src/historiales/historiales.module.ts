import { Module } from '@nestjs/common';
import { HistorialesService } from './historiales.service';
import { HistorialesController } from './historiales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialClinico } from './entities/historial.entity';
import { User } from 'src/users/entities/user.entity';
import { Turno } from 'src/turnos/entities/turno.entity';

@Module({
  // Importamos HistorialClinico para registrar la entidad.
  // También importamos User y Turno para que nuestro servicio
  // pueda usar sus repositorios para las validaciones.
  imports: [TypeOrmModule.forFeature([HistorialClinico, User, Turno])],
  controllers: [HistorialesController],
  providers: [HistorialesService],
})
export class HistorialesModule {}
