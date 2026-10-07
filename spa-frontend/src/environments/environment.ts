// Configuración por defecto (desarrollo). En producción se sustituye
// por environment.prod.ts mediante "fileReplacements" en angular.json.
export const environment = {
  production: false,
  /** URL base de la API (NestJS) */
  apiUrl: 'http://localhost:3000',
};
