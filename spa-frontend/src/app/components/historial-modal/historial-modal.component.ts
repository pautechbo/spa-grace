import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-modal.component.html',
})
export class HistorialModalComponent implements OnInit {
  @Input() clienteId!: number;
  @Input() clienteNombre!: string;
  @Input() turnoId?: number;
  @Output() closeModal = new EventEmitter<void>();

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/historiales`;

  entries = signal<any[]>([]);
  isLoading = signal(true);
  isCreating = signal(false);

  newEntry = { fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', notas: '' };

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading.set(true);
    this.http.get<any[]>(`${this.apiUrl}/cliente/${this.clienteId}`).subscribe({
      next: (data) => this.entries.set(data),
      error: () => this.entries.set([]),
    }).add(() => this.isLoading.set(false));
  }

  crearEntrada(): void {
    if (!this.newEntry.diagnostico && !this.newEntry.tratamiento) return;
    this.isCreating.set(true);
    this.http.post(this.apiUrl, {
      ...this.newEntry,
      id_cliente: this.clienteId,
      id_turno: this.turnoId || undefined,
    }).subscribe({
      next: () => { this.newEntry = { fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', notas: '' }; this.loadEntries(); },
      error: (err) => alert(err.error?.message || 'Error al guardar'),
    }).add(() => this.isCreating.set(false));
  }
}
