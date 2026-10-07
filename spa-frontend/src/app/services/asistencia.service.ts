import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Asistencia {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string | null;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly apiUrl = `${environment.apiUrl}/asistencia`;
  private http = inject(HttpClient);

  marcarEntrada(idEmpleado: number): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${this.apiUrl}/entrada/${idEmpleado}`, {});
  }

  marcarSalida(idEmpleado: number): Observable<Asistencia> {
    return this.http.post<Asistencia>(`${this.apiUrl}/salida/${idEmpleado}`, {});
  }

  getAsistencias(idEmpleado: number, fechaInicio?: string, fechaFin?: string): Observable<Asistencia[]> {
    let params = `?fecha_inicio=${fechaInicio || ''}&fecha_fin=${fechaFin || ''}`;
    return this.http.get<Asistencia[]>(`${this.apiUrl}/empleado/${id}${params}`);
  }
}
