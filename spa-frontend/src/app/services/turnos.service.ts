import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Cobro {
  id: number;
  estado_pago: 'pendiente_adelanto' | 'adelanto_pagado' | 'pagado_completo' | 'cancelado' | 'reembolsado';
  monto_total: number;
  monto_adelanto: number;
  monto_pendiente: number;
  metodo_pago_adelanto?: string;
  metodo_pago_final?: string;
  fecha_adelanto?: string;
  fecha_cobro_final?: string;
}
export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

export interface Turno {
  duracion_final: number;
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  notas_turno?: string;
  precio_servicio_base?: number;
  atendido_exitoso?: string;
  cliente: { id: number; nombre: string; };
  empleado: { id: number; usuario: { nombre: string; } };
  servicios: Servicio[];
  cobros: Cobro[];
}

export interface TurnoPayload {
  id_cliente: number;
  id_empleado: number;
  id_servicios: number[]; // Ahora es un array de IDs
  fecha: string;
  hora: string;
}


@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private readonly apiUrl = `${environment.apiUrl}/turnos`;
  private http = inject(HttpClient);

  getTurnos(estado?: string, empleado_id?: number, cliente_id?: number): Observable<Turno[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (empleado_id) params = params.set('empleado_id', empleado_id);
    if (cliente_id) params = params.set('cliente_id', cliente_id);
    return this.http.get<Turno[]>(this.apiUrl, { params });
  }

  getCountByCliente(): Observable<{ id_cliente: number; nombre: string; cantidad: number }[]> {
    return this.http.get<{ id_cliente: number; nombre: string; cantidad: number }[]>(`${this.apiUrl}/count-by-cliente`);
  }

  getTurnoById(id: number): Observable<Turno> {
    return this.http.get<Turno>(`${this.apiUrl}/${id}`);
  }

  createTurno(turnoData: TurnoPayload): Observable<Turno> {
    return this.http.post<Turno>(this.apiUrl, turnoData);
  }

  updateTurno(id: number, turnoData: Partial<TurnoPayload>): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}`, turnoData);
  }

  updateTurnoStatus(id: number, estado: string): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}`, { estado });
  }

  deleteTurno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  marcarAtendido(id: number): Observable<Turno> {
    return this.http.patch<Turno>(`${this.apiUrl}/${id}/atender`, {});
  }
}

