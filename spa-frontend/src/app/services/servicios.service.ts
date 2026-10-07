    import { HttpClient } from '@angular/common/http';
    import { environment } from '../../environments/environment';
    import { Injectable, inject } from '@angular/core';
    import { Observable } from 'rxjs';

      // Interface para un servicio
    export interface Servicio {
      id: number;
      nombre: string;
      descripcion: string;
      duracion: number;
      precio: number;
      activo: boolean;
      parent_servicio_id: number | null;
      hijos?: Servicio[];
    }

    // Interface para los datos al crear/actualizar
      export interface ServicioPayload {
      nombre: string;
      descripcion: string;
      duracion: number;
      precio: number;
      parent_servicio_id?: number | null;
      activo?: boolean;
    }


    @Injectable({
      providedIn: 'root'
    })
    export class ServiciosService {
      private readonly apiUrl = `${environment.apiUrl}/servicios`;
      private http = inject(HttpClient);

      constructor() { }

      /**
       * Obtiene la lista de todos los servicios.
       */
      getServicios(): Observable<Servicio[]> {
        return this.http.get<Servicio[]>(this.apiUrl);
      }
      createServicio(payload: ServicioPayload): Observable<Servicio> {
        return this.http.post<Servicio>(this.apiUrl, payload);
      }

      updateServicio(id: number, payload: Partial<ServicioPayload>): Observable<Servicio> {
        return this.http.patch<Servicio>(`${this.apiUrl}/${id}`, payload);
      }

      deleteServicio(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
      }
    }
