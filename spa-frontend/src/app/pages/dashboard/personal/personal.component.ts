import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Empleado, EmpleadosService } from '../../../services/empleados.service';
import { DisponibilidadService, Disponibilidad } from '../../../services/disponibilidad.service';
import { EmpleadoFormComponent } from '../../../components/empleado-form/empleado-form.component';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, EmpleadoFormComponent],
  templateUrl: './personal.component.html',
})
export class PersonalComponent implements OnInit {
  private empleadosService = inject(EmpleadosService);
  private disponibilidadService = inject(DisponibilidadService);

  public empleados = signal<Empleado[]>([]);
  public searchTerm = signal('');
  public isLoading = signal<boolean>(true);
  public isModalOpen = signal<boolean>(false);
  public empleadoSeleccionado = signal<Empleado | null>(null);
  public notification = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  public isHorarioModalOpen = signal(false);
  public empleadoHorario = signal<Empleado | null>(null);
  public horarios = signal<Disponibilidad[]>([]);
  public dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  filteredEmpleados = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.empleados();
    return this.empleados().filter(e =>
      e.usuario.nombre.toLowerCase().includes(term) ||
      e.usuario.email.toLowerCase().includes(term) ||
      e.especialidad?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.isLoading.set(true);
    this.empleadosService.getEmpleados().subscribe({
      next: (data) => {
        this.empleados.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los empleados', err);
        this.showNotification('Error al cargar el personal.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  openModalParaCrear(): void {
    this.empleadoSeleccionado.set(null);
    this.isModalOpen.set(true);
  }

  openModalParaEditar(empleado: Empleado): void {
    this.empleadoSeleccionado.set(empleado);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.empleadoSeleccionado.set(null);
  }

  handleEmpleadoGuardado(): void {
    this.loadEmpleados();
    const message = this.empleadoSeleccionado() ? 'Empleado actualizado con éxito.' : 'Empleado creado con éxito.';
    this.showNotification(message, 'success');
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3000);
  }

  openHorarioModal(empleado: Empleado): void {
    this.empleadoHorario.set(empleado);
    this.disponibilidadService.getByEmpleado(empleado.id).subscribe(data => this.horarios.set(data));
    this.isHorarioModalOpen.set(true);
  }

  closeHorarioModal(): void {
    this.isHorarioModalOpen.set(false);
    this.empleadoHorario.set(null);
  }

  getHorarioForDay(day: string): Disponibilidad | undefined {
    return this.horarios().find(h => h.dia_semana === day);
  }

  saveHorarios(): void {
    const emp = this.empleadoHorario();
    if (!emp) return;
    this.disponibilidadService.replaceAll(emp.id, this.horarios()).subscribe({
      next: (data) => { this.horarios.set(data); this.showNotification('Horarios guardados.', 'success'); },
      error: () => this.showNotification('Error al guardar horarios.', 'error'),
    });
  }

  toggleDia(dia: string): void {
    const existente = this.getHorarioForDay(dia);
    if (existente) {
      this.horarios.set(this.horarios().filter(h => h.dia_semana !== dia));
    } else {
      this.horarios.set([...this.horarios(), { id: 0, dia_semana: dia, hora_inicio: '09:00', hora_fin: '18:00', activo: true }]);
    }
  }
}

