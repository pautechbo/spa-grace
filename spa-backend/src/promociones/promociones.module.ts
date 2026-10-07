import { Module } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocion } from './entities/promocion.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  // Importamos Promocion para registrar la entidad.
  // También importamos Servicio para que nuestro servicio de promociones
  // pueda validar que el servicio aplicable existe.
  imports: [TypeOrmModule.forFeature([Promocion, Servicio])],
  controllers: [PromocionesController],
  providers: [PromocionesService],
})
export class PromocionesModule {}
