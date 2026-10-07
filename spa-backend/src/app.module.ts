import { Module } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
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
import { ENTITIES } from './entities';

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
        // Lista explícita: el globo sobre el directorio de salida no funciona
        // dentro del bundle serverless de Vercel (ver src/entities.ts).
        entities: ENTITIES,
        // `synchronize` solo si DB_SYNC=true explícitamente (entornos nuevos).
        // Nunca en producción.
        synchronize: config.get<string>('DB_SYNC', 'false') === 'true',
        // Aiven (y la mayoría de BDs gestionadas) exigen TLS.
        // DB_SSL=true activa SSL; DB_SSL_CA apunta a un fichero con el CA
        // propio de Aiven si querés verificar la identidad del servidor.
        ...(config.get<string>('DB_SSL', 'false') === 'true'
          ? {
              ssl:
                config.get<string>('DB_SSL_CA') &&
                existsSync(config.get<string>('DB_SSL_CA')!)
                  ? {
                      ca: readFileSync(config.get<string>('DB_SSL_CA')!),
                      rejectUnauthorized: true,
                    }
                  : { rejectUnauthorized: false },
            }
          : {}),
        // Pool pequeño y persistente: en serverless cada instancia mantiene su
        // propia conexión y el plan gratuito de Aiven tiene límite de ellas.
        extra: {
          connectionLimit:
            Number(config.get<number>('DB_POOL_SIZE', 5)) || 5,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000,
        },
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
