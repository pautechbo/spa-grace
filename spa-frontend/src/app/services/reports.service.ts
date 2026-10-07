import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// Define la estructura de la respuesta del reporte
export interface ReportSummary {
  [key: string]: number; // Ej: { "pendiente": 10, "atendido": 25 }
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;
  private http = inject(HttpClient);

  getSummaryByStatus(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${this.apiUrl}/summary-by-status`);
  }
}
