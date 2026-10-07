import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Importa 'withInterceptors'
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor'; // Importa nuestro interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Registramos el interceptor aquí
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};

