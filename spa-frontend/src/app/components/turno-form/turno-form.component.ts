import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turno, TurnosService, TurnoPayload } from '../../services/turnos.service';
import { User, UsersService } from '../../services/users.service';
import { Empleado, EmpleadosService } from '../../services/empleados.service';
import { Servicio, ServiciosService } from '../../services/servicios.service';
import { forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-turno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turno-form.component.html',
})
export class TurnoFormComponent implements OnInit {
  // --- Inputs y Outputs ---
  @Input() turnoParaEditar: Turno | null = null;
  // NUEVO INPUT para recibir la fecha y hora desde el calendario
  @Input() initialDate: { fecha: string, hora: string } | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() turnoGuardado = new EventEmitter<Turno>();

  // --- Inyección de Dependencias ---
  private fb = inject(FormBuilder);
  private turnosService = inject(TurnosService);
  private usersService = inject(UsersService);
  private empleadosService = inject(EmpleadosService);
  private serviciosService = inject(ServiciosService);

  // --- Estado del Componente ---
  turnoForm!: FormGroup;
  isEditMode = false;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  clientes = signal<User[]>([]);
  empleados = signal<Empleado[]>([]);
  allServices = signal<Servicio[]>([]);
  selectedServices = signal<Servicio[]>([]);
  serviceSearchCtrl = new FormControl('');
  searchTerm = signal('');
  showServiceResults = signal(false);

  // --- Señales Computadas ---
  availableServices = computed(() => {
    const term = this.searchTerm();
    const selectedIds = new Set(this.selectedServices().map(s => s.id));
    const services = this.allServices().filter(s => !selectedIds.has(s.id));
    if (!term) return services;
    return services.filter(s => s.nombre.toLowerCase().includes(term));
  });

  totalPaquete = computed(() => this.selectedServices().reduce((acc, curr) => acc + Number(curr.precio), 0));

  ngOnInit(): void {
    this.isEditMode = !!this.turnoParaEditar;
    this.initForm();
    this.loadSelectData();

    this.serviceSearchCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value?.toLowerCase() || '');
      this.showServiceResults.set(true);
    });
  }

  private initForm(): void {
    this.turnoForm = this.fb.group({
      id_cliente: [this.turnoParaEditar?.cliente.id ?? null, Validators.required],
      id_empleado: [this.turnoParaEditar?.empleado.id ?? null, Validators.required],
      fecha: [this.turnoParaEditar?.fecha || this.initialDate?.fecha || '', Validators.required],
      hora: [this.turnoParaEditar?.hora || this.initialDate?.hora || '', Validators.required],
    });
  }

  private loadSelectData(): void {
    forkJoin({
      clientes: this.usersService.getUsersByRole('cliente'),
      empleados: this.empleadosService.getEmpleados(),
      servicios: this.serviciosService.getServicios()
    }).subscribe(({ clientes, empleados, servicios }) => {
      this.clientes.set(clientes);
      this.empleados.set(empleados);
      this.allServices.set(servicios);

      if (this.isEditMode && this.turnoParaEditar?.servicios) {
        // Map servicios from Turno to the correct Servicio type from ServiciosService
        const serviciosMap = this.turnoParaEditar.servicios.map(serv => {
          // Find the matching service from allServices by id
          return this.allServices().find(s => s.id === serv.id);
        }).filter((s): s is Servicio => !!s); // Filter out undefined
        this.selectedServices.set(serviciosMap);
      }
    });
  }

  addService(service: Servicio): void {
    this.selectedServices.update(current => [...current, service]);
    this.serviceSearchCtrl.setValue('');
    this.showServiceResults.set(false);
  }

  removeService(serviceId: number): void {
    this.selectedServices.update(current => current.filter(s => s.id !== serviceId));
  }

  onSearchBlur(): void {
    setTimeout(() => this.showServiceResults.set(false), 200);
  }

  onSubmit(): void {
    if (this.turnoForm.invalid || this.selectedServices().length === 0) {
      this.turnoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.turnoForm.value;
    const turnoPayload: TurnoPayload = {
      id_cliente: formValue.id_cliente,
      id_empleado: formValue.id_empleado,
      fecha: formValue.fecha,
      hora: formValue.hora,
      id_servicios: this.selectedServices().map(s => s.id),
    };

    const action = this.isEditMode
      ? this.turnosService.updateTurno(this.turnoParaEditar!.id, turnoPayload)
      : this.turnosService.createTurno(turnoPayload);

    action.subscribe({
      next: (turnoFinal) => {
        this.turnoGuardado.emit(turnoFinal);
        this.closeModal.emit();
      },
      error: (err) => {
        this.submitError.set(err.error?.message || 'Error al guardar el turno. Intentalo de nuevo.');
        console.error('Error al guardar el turno', err);
      }
    }).add(() => this.isSubmitting.set(false));
  }
}
