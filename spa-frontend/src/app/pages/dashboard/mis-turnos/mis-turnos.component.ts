import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurnosService, Turno } from '../../../services/turnos.service';


@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos.component.html',
})
export class MisTurnosComponent implements OnInit {
  private turnosService = inject(TurnosService);

  turnos = signal<Turno[]>([]);
  isLoading = signal(true);
  filterEstado = signal<string>('todos');

  ngOnInit(): void {
    this.loadTurnos();
  }

  loadTurnos(): void {
    this.isLoading.set(true);
    this.turnosService.getTurnos().subscribe({
      next: (data) => this.turnos.set(data),
      error: (err) => console.error('Error al cargar turnos', err)
    }).add(() => this.isLoading.set(false));
  }

  filteredTurnos = () => {
    const f = this.filterEstado();
    if (f === 'todos') return this.turnos();
    return this.turnos().filter(t => t.estado === f);
  };
}
