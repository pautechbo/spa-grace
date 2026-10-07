# Spa Grace — Sistema de gestión para spa / consultorio

Monorepo con tres piezas:

| Carpeta        | Qué es                                        | Stack                                |
| -------------- | ---------------------------------------------- | ------------------------------------ |
| `spa-backend`  | API REST + landing estática                    | NestJS 11, TypeORM, MySQL, JWT       |
| `spa-frontend` | Dashboard interno                              | Angular 19, Tailwind 4, FullCalendar |
| `landing`      | Sitio público (se sirve desde el backend)      | HTML estático + Tailwind CDN         |

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

Se sirve automáticamente por el backend en la raíz (`/`). Su URL de destino del
dashboard se define en la etiqueta `<meta name="spa-app-url">` de
`landing/index.html`.

## Scripts útiles

**Backend** (`spa-backend`):

```bash
npm run build       # compilar
npm test            # jest — 25 suites
npm run test:cov    # con cobertura
npm run lint        # eslint
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

- [ ] Migraciones de TypeORM (hoy: `synchronize: false` + `ensureColumn` en `main.ts`).
- [ ] Endurecer CORS con `CORS_ORIGIN` en producción.
- [ ] Tests con cobertura real de la lógica de negocio (hoy solo smoke tests de DI).
- [ ] CI (build + tests) en GitHub Actions.
