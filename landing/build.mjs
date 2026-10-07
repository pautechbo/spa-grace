#!/usr/bin/env node
/**
 * Build de la landing para producción.
 *
 * `index.html` lleva los valores por defecto de desarrollo (API en same-origin
 * porque la landing la sirve el propio backend, y la app en localhost:4200).
 * Eso es lo correcto en local, pero en Vercel la landing vive en un origen
 * distinto, así que aquí se sustituyen por las URLs reales.
 *
 * Las URLs se toman de variables de entorno (API_URL / APP_URL / SITE_URL)
 * definidas en el proyecto de Vercel, de modo que se pueden cambiar y volver
 * a desplegar sin editar el HTML.
 *
 * Si una variable no está definida se conserva el valor por defecto del HTML.
 * Además se copia `robots.txt` a `dist/`, que es lo que Vercel sirve.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'index.html');
const outDir = join(here, 'dist');
const outFile = join(outDir, 'index.html');

const replacements = [
  { meta: 'api-url', value: process.env.API_URL },
  { meta: 'spa-app-url', value: process.env.APP_URL },
  // La URL pública de la propia landing: `og:url` y `canonical`.
  { meta: 'og:url', value: process.env.SITE_URL },
  { meta: 'canonical', value: process.env.SITE_URL },
];

let html = readFileSync(src, 'utf8');

for (const { meta, value } of replacements) {
  if (!value) {
    console.warn(`[build] ${meta}: variable no definida, se mantiene el valor por defecto`);
    continue;
  }

  // Admite <meta name="X">, <meta property="X"> (Open Graph) y
  // <link rel="X" href="...">, todos con un único valor a sustituir.
  const pattern = new RegExp(
    `(<meta\\s+(?:name|property)="${meta}"\\s+content=")([^"]*)(")` +
      `|(<link\\s+rel="${meta}"\\s+href=")([^"]*)(")`,
    'i',
  );

  if (!pattern.test(html)) {
    console.error(`[build] No se encontró la etiqueta con "${meta}" en index.html`);
    process.exit(1);
  }

  html = html.replace(
    pattern,
    (_m, metaOpen, _metaValue, metaClose, linkOpen, _linkValue, linkClose) =>
      metaOpen !== undefined
        ? `${metaOpen}${value}${metaClose}`
        : `${linkOpen}${value}${linkClose}`,
  );
  console.log(`[build] ${meta} = ${value}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, html, 'utf8');
console.log(`[build] Escrito ${outFile} (${html.length} bytes)`);

// robots.txt no pasa por ningún transformador, así que lo copiamos a mano.
const robots = join(here, 'robots.txt');
if (existsSync(robots)) {
  copyFileSync(robots, join(outDir, 'robots.txt'));
  console.log('[build] robots.txt → dist/robots.txt');
} else {
  console.warn('[build] no existe landing/robots.txt, se omite');
}
