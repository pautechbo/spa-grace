import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

/**
 * Arranque del servidor local.
 *
 * Toda la configuración compartida (validación, CORS, columna asegurada y la
 * landing estática) vive en `bootstrap.ts` para que el handler serverless de
 * Vercel aplique exactamente la misma.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await configureApp(app, { serveLanding: true });

  const port = app.get(ConfigService).get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Servidor corriendo en puerto ${port}`);
}

void bootstrap();
