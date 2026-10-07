import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService, Servicio } from '../../../services/servicios.service';
import { ServicioFormComponent } from '../../../components/servicio-form/servicio-form.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ServicioFormComponent],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent implements OnInit {
  private serviciosService = inject(ServiciosService);

  public servicios = signal<Servicio[]>([]);
  public searchTerm = signal('');
  public isLoading = signal<boolean>(true);
  public isModalOpen = signal<boolean>(false);
  public servicioSeleccionado = signal<Servicio | null>(null);
  public notification = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  public isConfirmModalOpen = signal<boolean>(false);
  public confirmAction: { message: string, onConfirm: () => void } | null = null;

  filteredServicios = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.servicios();
    return this.servicios().filter(s =>
      s.nombre.toLowerCase().includes(term) ||
      s.descripcion?.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.isLoading.set(true);
    this.serviciosService.getServicios().subscribe({
      next: (data) => {
        this.servicios.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los servicios', err);
        this.showNotification('Error al cargar los servicios.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  // --- Manejo de Modales ---
  openModalParaCrear(): void {
    this.servicioSeleccionado.set(null);
    this.isModalOpen.set(true);
  }

  openModalParaEditar(servicio: Servicio): void {
    this.servicioSeleccionado.set(servicio);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.servicioSeleccionado.set(null);
  }

  handleServicioGuardado(): void {
    this.loadServicios();
    const message = this.servicioSeleccionado() ? 'Servicio actualizado con éxito.' : 'Servicio creado con éxito.';
    this.showNotification(message, 'success');
  }

  // --- Lógica de Notificaciones y Confirmación ---
  showNotification(message: string, type: 'success' | 'error') {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3000);
  }

  askForDelete(servicio: Servicio) {
    this.confirmAction = {
      message: `¿Estás seguro de que quieres eliminar el servicio "${servicio.nombre}"?`,
      onConfirm: () => this.deleteServicio(servicio.id)
    };
    this.isConfirmModalOpen.set(true);
  }

  confirmAndDelete() {
    this.confirmAction?.onConfirm();
    this.isConfirmModalOpen.set(false);
  }

  deleteServicio(id: number) {
    this.serviciosService.deleteServicio(id).subscribe({
      next: () => {
        this.loadServicios();
        this.showNotification('Servicio eliminado con éxito.', 'success');
      },
      error: (err) => {
        this.showNotification('Error al eliminar el servicio.', 'error');
        console.error(err);
      }
    });
  }
}
