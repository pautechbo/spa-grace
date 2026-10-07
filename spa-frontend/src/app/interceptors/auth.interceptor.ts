import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token del localStorage.
  const token = localStorage.getItem('accessToken');

  // Si no hay token, dejamos pasar la petición sin modificarla.
  if (!token) {
    return next(req);
  }

  // Si hay un token, clonamos la petición y le añadimos la cabecera de autorización.
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  // Dejamos que la petición modificada continúe su camino.
  return next(authReq);
};
