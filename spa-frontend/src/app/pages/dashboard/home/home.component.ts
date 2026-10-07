import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from '../../../services/auth.service';
import { ReportsService, ReportSummary } from '../../../services/reports.service';
import { TurnosService, Turno } from '../../../services/turnos.service';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexTitleSubtitle } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  private reportsService = inject(ReportsService);
  private turnosService = inject(TurnosService);

  summary = signal<ReportSummary | null>(null);
  isLoading = signal(true);
  chartOptions = signal<ChartOptions | null>(null);
  misTurnos = signal<Turno[]>([]);
  turnosHoy = signal<Turno[]>([]);
  contadorClientes = signal<{ id_cliente: number; nombre: string; cantidad: number }[]>([]);

  totalTurnos = computed(() => this.misTurnos().length);
  proximosTurnos = computed(() => this.misTurnos().filter(t => t.estado === 'pendiente' || t.estado === 'confirmado'));
  atendidos = computed(() => this.misTurnos().filter(t => t.estado === 'atendido'));
  serviciosRecibidos = computed(() => this.misTurnos().reduce((acc, t) => acc + (t.servicios?.length || 0), 0));

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const user = this.authService.currentUser();
    if (!user) { this.isLoading.set(false); return; }

    if (user.rol === 'admin' || user.rol === 'recepcionista') {
      this.reportsService.getSummaryByStatus().subscribe({
        next: (data) => { this.summary.set(data); this.setupChart(data); },
        error: (err) => console.error('Error cargando summary:', err),
      });
    }

    if ((user.rol === 'terapeuta' || user.rol === 'recepcionista') && user.id_empleado) {
      this.turnosService.getTurnos(undefined, user.id_empleado).subscribe({
        next: (data) => {
          const hoy = new Date().toISOString().split('T')[0];
          this.turnosHoy.set(data.filter(t => t.fecha === hoy));
        },
        error: (err) => console.error('Error cargando turnos hoy:', err),
      });
    }

    if (user.rol === 'cliente') {
      this.turnosService.getTurnos(undefined, undefined, user.id).subscribe({
        next: (data) => this.misTurnos.set(data),
        error: (err) => console.error('Error cargando mis turnos:', err),
      });
    }

    if (user.rol === 'admin') {
      this.turnosService.getCountByCliente().subscribe({
        next: (data) => this.contadorClientes.set(data.slice(0, 5)),
        error: (err) => console.error('Error cargando countByCliente:', err),
      });
    }

    this.isLoading.set(false);
  }

  private setupChart(data: ReportSummary): void {
    const labels = Object.keys(data).map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const series = Object.values(data);
    this.chartOptions.set({
      series, chart: { type: 'pie', height: 280 },
      labels, title: { text: 'Turnos por Estado' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
    });
  }
}
