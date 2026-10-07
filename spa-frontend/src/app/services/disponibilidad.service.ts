import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Disponibilidad {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly apiUrl = `${environment.apiUrl}/disponibilidad`;
  private http = inject(HttpClient);

  getByEmpleado(id: number): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.apiUrl}/empleado/${id}`);
  }

  replaceAll(idEmpleado: number, horarios: { dia_semana: string; hora_inicio: string; hora_fin: string }[]): Observable<Disponibilidad[]> {
    return this.http.post<Disponibilidad[]>(`${this.apiUrl}/replace-all`, { id_empleado: idEmpleado, horarios });
  }
}
