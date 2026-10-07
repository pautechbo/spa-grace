import { Module } from '@nestjs/common';
import { CobrosService } from './cobros.service';
import { CobrosController } from './cobros.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cobro } from './entities/cobro.entity';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Promocion } from 'src/promociones/entities/promocion.entity';

@Module({
  // Importamos Promocion para que el servicio de cobros
  // pueda usar su repositorio para validar los códigos de descuento.
  imports: [TypeOrmModule.forFeature([Cobro, Turno, Promocion])],
  controllers: [CobrosController],
  providers: [CobrosService],
})
export class CobrosModule {}
