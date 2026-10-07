#!/usr/bin/env node
/**
 * Build de la landing para producción.
 *
 * `index.html` lleva los valores por defecto de desarrollo (API en same-origin
 * porque la landing la sirve el propio backend, y la app en localhost:4200).
 * Eso es lo correcto en local, pero en Vercel la landing vive en un origen
 * distinto, así que aquí se sustituyen por las URLs reales.
 *
 * Las URLs se toman de variables de entorno (API_URL / APP_URL) definidas en
 * el proyecto de Vercel, de modo que se pueden cambiar y volver a desplegar
 * sin editar el HTML.
 *
 * Si una variable no está definida se conserva el valor por defecto del HTML.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'index.html');
const outDir = join(here, 'dist');
const outFile = join(outDir, 'index.html');

const replacements = [
  { meta: 'api-url', value: process.env.API_URL },
  { meta: 'spa-app-url', value: process.env.APP_URL },
];

let html = readFileSync(src, 'utf8');

for (const { meta, value } of replacements) {
  if (!value) {
    console.warn(`[build] ${meta}: variable no definida, se mantiene el valor por defecto`);
    continue;
  }

  const pattern = new RegExp(
    `(<meta\\s+name="${meta}"\\s+content=")[^"]*(")`,
    'i',
  );

  if (!pattern.test(html)) {
    console.error(`[build] No se encontró <meta name="${meta}"> en index.html`);
    process.exit(1);
  }

  html = html.replace(pattern, `$1${value}$2`);
  console.log(`[build] ${meta} = ${value}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, html, 'utf8');
console.log(`[build] Escrito ${outFile} (${html.length} bytes)`);
