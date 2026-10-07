import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * Asegura que exista una columna antes de usarla.
 *
 * El proyecto tiene `synchronize: false` y todavía no gestiona el esquema con
 * migraciones de TypeORM, así que esta función reemplaza al `ALTER TABLE`
 * silencioso que había antes: es idempotente, comprueba primero con
 * information_schema y deja traza por consola cuando modifica el esquema.
 *
 * TODO: sustituir por migraciones oficiales (`typeorm migration:generate`).
 */
export async function ensureColumn(
  dataSource: DataSource,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  try {
    const rows: { n: number | string }[] = await dataSource.query(
      `SELECT COUNT(*) AS n
         FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?`,
      [table, column],
    );

    if (Number(rows[0]?.n ?? 0) > 0) return;

    await dataSource.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`,
    );
    console.warn(`[db] Columna añadida: ${table}.${column} (${definition})`);
  } catch (err) {
    console.error(
      `[db] No se pudo asegurar ${table}.${column}:`,
      (err as Error).message,
    );
  }
}

export interface ConfigureOptions {
  /**
   * Sirve la landing como archivos estáticos desde el propio backend.
   *
   * Solo aplica en local: en Vercel la landing es un sitio estático propio,
   * así que el handler serverless lo deja en `false`.
   */
  serveLanding?: boolean;
}

/**
 * Configuración compartida entre el servidor local (`main.ts`) y el handler
 * serverless de Vercel (`api/index.ts`). Debe aplicarse ANTES de `app.init()`
 * o `app.listen()`.
 */
export async function configureApp(
  app: INestApplication,
  options: ConfigureOptions = {},
): Promise<void> {
  const configService = app.get(ConfigService);

  await ensureColumn(
    app.get(DataSource),
    'turnos',
    'atendido_exitoso',
    'TIMESTAMP NULL',
  );

  // Orígenes permitidos: CORS_ORIGIN=https://app.ejemplo.com,https://ejemplo.com
  // Sin definir, se permite cualquier origen (adecuado en desarrollo).
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(',').map((origin) => origin.trim()),
    });
  } else {
    app.enableCors();
    if (configService.get<string>('NODE_ENV') === 'production') {
      console.warn(
        '[cors] CORS abierto: define CORS_ORIGIN para restringirlo en producción.',
      );
    }
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (options.serveLanding) {
    const expressApp = app as NestExpressApplication;
    expressApp.useStaticAssets(join(__dirname, '..', '..', 'landing'), {
      index: 'index.html',
    });
  }
}
