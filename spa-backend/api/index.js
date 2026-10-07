/**
 * Entrada serverless de Vercel para el backend NestJS.
 *
 * IMPORTANTE: este fichero es JavaScript a propósito.
 *
 * Vercel compila `api/*.ts` con esbuild, que NO implementa
 * `emitDecoratorMetadata`. NestJS necesita ese metadato (`design:paramtypes`)
 * para resolver la inyección de dependencias de constructores, así que si
 * dejáramos el handler en TypeScript la app arrancaría sin poder inyectar
 * repositorios ni servicios.
 *
 * Por eso compilamos NestJS con `nest build` (tsc, sí soporta decoradores con
 * metadatos) hacia `dist/` y este módulo solo hace `require` de ese resultado.
 */
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/bootstrap');

/**
 * La app se construye UNA sola vez por instancia fría y se reutiliza en todas
 * las peticiones siguientes. Sin esta caché, cada invocación abriría una
 * conexión nueva a MySQL y agotaría el límite del plan gratuito de Aiven.
 */
let cachedApp;

async function createApp() {
  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    // Log mínimo: en Vercel la consola solo se ve en los logs de la plataforma.
    logger: ['error', 'warn'],
    // El header ya lo gestiona configureApp con CORS_ORIGIN.
    cors: false,
  });

  // Misma configuración que usa el servidor local (main.ts): validación,
  // CORS, columna asegurada y pool de conexiones. Sin assets estáticos: la
  // landing despliega como sitio propio en Vercel.
  await configureApp(app, { serveLanding: false });

  await app.init();

  return server;
}

module.exports = async (req, res) => {
  if (!cachedApp) {
    cachedApp = createApp().catch((err) => {
      // Si el arranque falla (p. ej. BD inaccesible) descartamos la caché para
      // que el siguiente intento no reutilice un estado roto.
      cachedApp = undefined;
      throw err;
    });
  }

  const server = await cachedApp;
  return server(req, res);
};
