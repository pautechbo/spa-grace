import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './users.service';
import { Servicio } from './servicios.service';

    export interface Empleado {
      id: number;
      especialidad: string;
      activo: boolean;
      usuario: {
        rol: string;
        id: number;
        nombre: string;
        email: string;
        telefono: string;
        username: string;
      }
      servicios: Servicio[];
    }
    export interface EmpleadoUsuarioPayload {
      nombre: string;
      email: string;
      password: string;
      username?: string;
      rol: string;
    }

    export interface EmpleadoPayload {
      usuario: EmpleadoUsuarioPayload;
      especialidad: string;
      activo: boolean;
      serviciosIds: number[];
    }

    export interface EmpleadoUpdatePayload {
      especialidad?: string;
      activo?: boolean;
      serviciosIds?: number[];
    }

    @Injectable({
      providedIn: 'root'
    })
    export class EmpleadosService {
      private readonly apiUrl = `${environment.apiUrl}/empleados`;
      private http = inject(HttpClient);

        getEmpleados(): Observable<Empleado[]> {
          return this.http.get<Empleado[]>(this.apiUrl);
        }

        createEmpleado(payload: EmpleadoPayload): Observable<Empleado> {
          return this.http.post<Empleado>(this.apiUrl, payload);
        }

        updateEmpleado(id: number, payload: EmpleadoUpdatePayload): Observable<Empleado> {
          return this.http.patch<Empleado>(`${this.apiUrl}/${id}`, payload);
        }

        replaceServicios(id: number, serviciosIds: number[]): Observable<Empleado> {
          return this.http.put<Empleado>(`${this.apiUrl}/${id}/servicios`, { serviciosIds });
        }

        asignarServicio(empleadoId: number, servicioId: number): Observable<void> {
          return this.http.post<void>(`${this.apiUrl}/${empleadoId}/servicios`, { id_servicio: servicioId });
        }
    }
