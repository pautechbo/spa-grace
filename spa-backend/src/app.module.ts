import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServiciosModule } from './servicios/servicios.module';
import { TurnosModule } from './turnos/turnos.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ReportsModule } from './reports/reports.module';
import { CobrosModule } from './cobros/cobros.module';
import { HistorialesModule } from './historiales/historiales.module';
import { PromocionesModule } from './promociones/promociones.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { PagosEmpleadosModule } from './pagos-empleados/pagos-empleados.module';
import { AsistenciaModule } from './asistencia/asistencia.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'spa_consultorio_db2'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // `synchronize` solo si DB_SYNC=true explícitamente (entornos nuevos).
        // Nunca en producción.
        synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
      }),
    }),
    AuthModule,
    UsersModule,
    ServiciosModule,
    TurnosModule,
    EmpleadosModule,
    ReportsModule,
    CobrosModule,
    HistorialesModule,
    PromocionesModule,
    DisponibilidadModule,
    PagosEmpleadosModule,
    AsistenciaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
