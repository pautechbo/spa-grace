import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Turno, Cobro, Servicio])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
