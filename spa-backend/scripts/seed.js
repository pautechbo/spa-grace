#!/usr/bin/env node
/**
 * Semilla de datos de Spa Grace.
 *
 * Crea el usuario administrador y los servicios de ejemplo, para que la
 * aplicación no arranque vacía. Es idempotente: se puede ejecutar tantas
 * veces como se quiera sin duplicar nada.
 *
 * Por qué un script en JavaScript y no en TypeScript:
 * igual que `api/index.js`, evita que haya que resolver los alias `src/*`
 * y los decoradores con metadatos fuera del compilado de Nest. Se apoya en
 * `dist/`, así que hay que ejecutar `npm run build` antes.
 *
 * Uso:
 *   npm run build && npm run seed            # contra .env (local)
 *   DB_HOST=... DB_PASSWORD=... npm run seed # contra otro servidor (p. ej. Aiven)
 *
 * Variables reconocidas (todas opcionales, con valores por defecto):
 *   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 *   DB_SSL=true             TLS (imprescindible en Aiven)
 *   DB_SSL_CA=/ruta/ca.pem  verificar el servidor con el CA propio
 *   SEED_ADMIN_USERNAME     por defecto admin
 *   SEED_ADMIN_PASSWORD     por defecto admin1234  ⚠ cambiar en producción
 *   SEED_ADMIN_EMAIL        por defecto admin@spagrace.bo
 */
const fs = require('fs');
const path = require('path');
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// dotenv NO sobreescribe variables ya definidas, así que lo que se pase por
// la línea de comandos (o por el entorno) tiene prioridad sobre .env.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const distEntities = path.join(__dirname, '..', 'dist', 'entities.js');
if (!fs.existsSync(distEntities)) {
  console.error(
    '[seed] No se encontró dist/entities.js.\n' +
      '       Ejecuta primero:  npm run build',
  );
  process.exit(1);
}
const { ENTITIES } = require(distEntities);

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin1234';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@spagrace.bo';

/**
 * Servicios de ejemplo. Coinciden con los de reserva de la landing
 * (`FALLBACK_SERVICES` en landing/index.html) para que ambos entornos
 * muestren exactamente lo mismo.
 *
 * Precios en bolivianos (Bs.).
 */
const SERVICIOS = [
  {
    nombre: 'Masajes Relajantes',
    descripcion:
      'Desconectá del estrés con técnicas de masaje profundas y aceites esenciales.',
    duracion: 60,
    precio: 120,
  },
  {
    nombre: 'Faciales Premium',
    descripcion:
      'Tratamiento facial personalizado según tu tipo de piel, con arcillas andinas.',
    duracion: 45,
    precio: 150,
  },
  {
    nombre: 'Aromaterapia Andina',
    descripcion:
      'Terapia con aceites de yerba menta y muña para equilibrar cuerpo y mente.',
    duracion: 50,
    precio: 130,
  },
  {
    nombre: 'Sauna y Baño Turco',
    descripcion:
      'Relajación total con circuito de aguas termales y salones de vapor.',
    duracion: 90,
    precio: 200,
  },
  {
    nombre: 'Reflexología',
    descripcion: 'Masaje podal que estimula puntos de energía del cuerpo.',
    duracion: 40,
    precio: 100,
  },
  {
    nombre: 'Ritual de Quinoa',
    descripcion:
      'Exfoliación e hidratación profunda con productos 100% bolivianos.',
    duracion: 75,
    precio: 180,
  },
];

/** Configuración de conexión, idéntica a la de src/app.module.ts. */
function buildOptions() {
  const options = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spa_consultorio_db2',
    entities: ENTITIES,
    // Nunca sincronizamos desde el seed: el esquema es responsabilidad de
    // las migraciones (y en Aiven `sql_require_primary_key` impide el sync).
    synchronize: false,
    logging: false,
  };

  if (process.env.DB_SSL === 'true') {
    const caPath = process.env.DB_SSL_CA;
    options.ssl =
      caPath && fs.existsSync(caPath)
        ? { ca: fs.readFileSync(caPath), rejectUnauthorized: true }
        : { rejectUnauthorized: false };
  }

  return options;
}

async function seedAdmin(ds) {
  const users = ds.getRepository('User');
  const existing = await users.findOne({
    where: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
  });

  if (existing) {
    console.log(
      `[seed] admin: ya existe "${existing.username}" (rol ${existing.rol})`,
    );
    return existing;
  }

  const created = await users.save({
    nombre: 'Administrador Spa Grace',
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    rol: 'admin',
    telefono: '+591 70000000',
  });

  console.log(
    `[seed] admin: creado "${created.username}" (${created.email}) → id ${created.id}`,
  );
  console.log(`[seed] admin: contraseña = ${ADMIN_PASSWORD}`);
  if (ADMIN_PASSWORD === 'admin1234') {
    console.warn(
      '[seed] ⚠  Estás usando la contraseña por defecto. Cámbiala antes de\n' +
        '       exponer la aplicación en público (SEED_ADMIN_PASSWORD o UPDATE\n' +
        '       manual sobre la tabla usuarios).',
    );
  }
  return created;
}

async function seedServicios(ds) {
  const servicios = ds.getRepository('Servicio');
  const count = await servicios.count();

  if (count > 0) {
    console.log(`[seed] servicios: ya hay ${count}, no se modifica nada`);
    return;
  }

  const created = await servicios.save(
    SERVICIOS.map((s) => ({ ...s, activo: true, parentServicio: null })),
  );
  console.log(`[seed] servicios: creados ${created.length}`);
}

async function main() {
  const options = buildOptions();
  console.log(
    `[seed] conectando a ${options.host}:${options.port}/${options.database}` +
      ` como ${options.username}${options.ssl ? ' (TLS)' : ''}`,
  );

  const ds = new DataSource(options);
  await ds.initialize();

  try {
    await seedAdmin(ds);
    await seedServicios(ds);
    console.log('[seed] listo');
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('[seed] error:', err.message || err);
  process.exit(1);
});
