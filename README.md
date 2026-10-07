# Spa Grace — Sistema de gestión para spa / consultorio

Monorepo con tres piezas:

| Carpeta        | Qué es                                   | Stack                                |
| -------------- | ----------------------------------------- | ------------------------------------ |
| `spa-backend`  | API REST                                 | NestJS 11, TypeORM, MySQL, JWT       |
| `spa-frontend` | Dashboard interno                        | Angular 19, Tailwind 4, FullCalendar |
| `landing`      | Sitio público                            | HTML estático + Tailwind CDN         |

Cada carpeta se despliega como su propio proyecto de Vercel (ver
[Despliegue en producción](#despliegue-en-producción)).

## Requisitos

- Node.js 20+
- MySQL 8 (o compatible)

## Puesta en marcha

### 1. Base de datos

Crea la base de datos (por defecto `spa_consultorio_db2`, configurable vía `.env`):

```sql
CREATE DATABASE spa_consultorio_db2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Nota sobre el esquema:** el backend corre con `synchronize: false` y todavía
> no usa migraciones de TypeORM. Si estás levantando un entorno nuevo desde cero,
> puedes habilitar `DB_SYNC=true` una sola vez para que TypeORM genere las tablas
> desde las entidades y después volver a `false`. Ver `spa-backend/src/app.module.ts`.
>
> **Cuidado con bases gestionadas:** el `synchronize` crea la tabla interna
> `typeorm_metadata` **sin clave primaria**, lo que falla con el error
> `sql_require_primary_key is set` en servicios como Aiven o PlanetScale (y los
> reintentos del arranque acaban agotando el *timeout* de la función). En esos
> entornos genera el esquema fuera de `synchronize` (por ejemplo, volcando el DDL
> de una base local ya sincronizada) y deja `DB_SYNC=false`.

### 2. Backend

```bash
cd spa-backend
cp .env.example .env      # y completar los valores
npm install
npm run start:dev         # http://localhost:3000
```

`JWT_SECRET` es **obligatorio**: sin él el servidor no arranca a propósito.
Genera uno con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Frontend

```bash
cd spa-frontend
npm install
npm start                 # http://localhost:4200
```

La URL de la API se configura en un solo lugar:
`spa-frontend/src/environments/environment.ts` (dev) y
`environment.prod.ts` (producción, sustituido por `fileReplacements`).

### 4. Landing

En local la sirve el backend en la raíz (`/`). Sus URLs de destino se inyectan en
build time por `landing/build.mjs` a partir de `API_URL` y `APP_URL`; si no se
ejecuta, `index.html` conserva los valores por defecto de desarrollo
(`api-url` vacío y `spa-app-url` en `localhost:4200`).

## Despliegue en producción

Tres proyectos de Vercel en el scope `club-atletas-de-cristo` (cada uno con su
propio `.vercel/project.json`, `.vercelignore` y `vercel.json`):

| Proyecto          | URL                              | Fuente                |
| ----------------- | -------------------------------- | --------------------- |
| `spa-grace`       | https://spa-grace.vercel.app     | `landing/`            |
| `spa-grace-app`   | https://spa-grace-app.vercel.app  | `spa-frontend/`       |
| `spa-grace-api`   | https://spa-grace-api.vercel.app  | `spa-backend/api/`    |

### Por qué el handler está en JavaScript

`spa-backend/api/index.js` está escrito a mano y en JS (no TS): el compilador que
usa Vercel para `api/*.ts` es un esbuild sin `emitDecoratorMetadata`, lo que
rompe la inyección de dependencias por constructor de NestJS. Carga el módulo ya
compilado (`dist/`) y deja la app en caché a nivel de módulo para no pagar el
arranque en cada petición. Por el mismo motivo las entidades se registran de forma
explícita en `spa-backend/src/entities.ts`: el glob con `__dirname` no encuentra
nada dentro del *bundle*.

### Variables de entorno

**`spa-grace-api`** (todas marcadas como *Secret*):

| Variable                     | Valor                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `JWT_SECRET`                 | generado con `node -e "..."` (obligatorio)                  |
| `CORS_ORIGIN`                | `https://spa-grace.vercel.app,https://spa-grace-app.vercel.app` |
| `DB_HOST`, `DB_PORT`         | host y puerto del MySQL de Aiven                            |
| `DB_USERNAME`, `DB_PASSWORD` | usuario propio de la base (no el `avnadmin` por defecto)    |
| `DB_NAME`                    | base de datos del proyecto                                  |
| `DB_SSL`                     | `true` (Aiven exige TLS)                                    |
| `DB_SYNC`                    | `false` — el esquema ya está creado                         |

**`spa-grace`** (la landing):

| Variable  | Valor                                            |
| --------- | ------------------------------------------------ |
| `API_URL` | `https://spa-grace-api.vercel.app`               |
| `APP_URL` | `https://spa-grace-app.vercel.app`               |
| `SITE_URL`| `https://spa-grace.vercel.app` (para `og:url` y `<link rel="canonical">`) |

`landing/build.mjs` las inyecta en el HTML al construir `dist/` y copia además
`robots.txt`; si falta alguna, se avisa y se conserva el valor por defecto.

> Un cambio de variable **no surte efecto hasta que se vuelva a desplegar**.

### Base de datos (Aiven)

MySQL 8.4 gestionado en el plan gratuito `free-1-1gb` (uno por cuenta, sin tarjeta).

**El `synchronize` de TypeORM no puede usarse allí**: Aiven activa
`sql_require_primary_key` y la tabla interna `typeorm_metadata` no tiene clave
primaria. El esquema se creó volcando el DDL de una base local ya sincronizada
(excluyendo `typeorm_metadata`, que solo hacen falta para migraciones) y dejando
`DB_SYNC=false`.

### Semilla de datos

`register` fuerza `rol: cliente`, así que no existe ninguna forma de crear un
`admin` desde la aplicación. `scripts/seed.js` lo resuelve y además da de alta los
servicios de ejemplo (los mismos que muestra la landing):

```bash
cd spa-backend
npm run build
npm run seed                                  # contra .env (local)
SEED_ADMIN_PASSWORD=... DB_HOST=... npm run seed   # contra Aiven
```

Es idempotente: no duplica usuarios ni servicios. La contraseña del administrador
sale por `SEED_ADMIN_PASSWORD` (por defecto `admin1234`) — **cámbiala en cualquier
entorno público**.

## Scripts útiles

**Backend** (`spa-backend`):

```bash
npm run build       # compilar
npm test            # jest — 25 suites
npm run test:cov    # con cobertura
npm run lint        # eslint
npm run seed        # admin + servicios de ejemplo (idempotente)
```

**Frontend** (`spa-frontend`):

```bash
npm run build       # build producción
npm test            # karma/jest headless — 23 tests
```

## Autenticación y roles

- Login en `POST /auth/login` → devuelve `accessToken` (JWT Bearer).
- Roles: `admin`, `recepcionista`, `terapeuta`, `cliente`.
- Guards: `JwtAuthGuard` + `RolesGuard` con `@Roles(...)` por endpoint.

## Endpoints principales

`/auth`, `/users`, `/empleados`, `/servicios`, `/turnos`, `/cobros`,
`/promociones`, `/historiales`, `/disponibilidad`, `/pagos-empleados`,
`/asistencia`, `/reports`.

## Pendiente / deuda técnica

- [x] Endurecer CORS con `CORS_ORIGIN` en producción.
- [ ] Migraciones de TypeORM (hoy: `synchronize: false` + `ensureColumn` en
      `bootstrap.ts`; en Aiven el esquema se creó a mano por `sql_require_primary_key`).
- [ ] Tests con cobertura real de la lógica de negocio (hoy solo smoke tests de DI).
- [ ] CI (build + tests) en GitHub Actions.
- [ ] Cambiar la contraseña del administrador creado por `npm run seed` en el
      entorno público y no usar nunca el valor por defecto.
- [ ] Sembrar también empleados / turnos de ejemplo, para que el panel no arranque
      a cero.
