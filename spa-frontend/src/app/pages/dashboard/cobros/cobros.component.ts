import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../../services/cobros.service';
import { Cobro } from '../../../services/turnos.service';

@Component({
  selector: 'app-cobros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cobros.component.html',
})
export class CobrosComponent implements OnInit {
  private cobrosService = inject(CobrosService);

  cobros = signal<Cobro[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  filterEstado = signal<string>('todos');

  filteredCobros = computed(() => {
    let list = this.cobros();
    const f = this.filterEstado();
    if (f !== 'todos') list = list.filter(c => c.estado_pago === f);
    const s = this.searchTerm().toLowerCase();
    if (s) list = list.filter(c => String(c.monto_total).includes(s) || String(c.id).includes(s));
    return list;
  });

  totalIngresos = computed(() => this.cobros().reduce((acc, c) => acc + Number(c.monto_total), 0));
  totalAdelantos = computed(() => this.cobros().reduce((acc, c) => acc + Number(c.monto_adelanto), 0));
  totalPendiente = computed(() => this.totalIngresos() - this.totalAdelantos());
  pagados = computed(() => this.cobros().filter(c => c.estado_pago === 'pagado_completo').length);
  reembolsados = computed(() => this.cobros().filter(c => c.estado_pago === 'reembolsado').length);

  ngOnInit(): void {
    this.loadCobros();
  }

  loadCobros(): void {
    this.isLoading.set(true);
    this.cobrosService.getCobros().subscribe({
      next: (data) => this.cobros.set(data),
      error: (err) => console.error('Error al cargar cobros', err)
    }).add(() => this.isLoading.set(false));
  }
}
