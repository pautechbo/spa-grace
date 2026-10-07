import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cobro } from './turnos.service';

export interface PagoPayload {
  monto_adelanto?: number;
  metodo_pago_adelanto?: string;
  metodo_pago_final?: string;
  estado_pago: 'adelanto_pagado' | 'pagado_completo';
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  private readonly apiUrl = `${environment.apiUrl}/cobros`;
  private http = inject(HttpClient);

  getCobros(): Observable<Cobro[]> {
    return this.http.get<Cobro[]>(this.apiUrl);
  }

  updateCobro(id: number, payload: Partial<PagoPayload>): Observable<Cobro> {
    return this.http.patch<Cobro>(`${this.apiUrl}/${id}`, payload);
  }

  // --- MÉTODO AÑADIDO ---
  // Este es el método que tu AgendaComponent está intentando llamar.
  reembolsarAdelanto(id: number): Observable<Cobro> {
    return this.http.patch<Cobro>(`${this.apiUrl}/${id}/reembolsar`, {});
  }
}

