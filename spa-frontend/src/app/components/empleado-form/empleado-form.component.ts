import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Empleado, EmpleadoPayload, EmpleadosService } from '../../services/empleados.service';
import { Servicio, ServiciosService } from '../../services/servicios.service';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleado-form.component.html',
})
export class EmpleadoFormComponent implements OnInit {
  @Input() empleadoParaEditar: Empleado | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() empleadoGuardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private empleadosService = inject(EmpleadosService);
  private serviciosService = inject(ServiciosService);

  empleadoForm!: FormGroup;
  isEditMode = false;
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  allServices = signal<Servicio[]>([]);
  serviciosAsignados = new Set<number>();

  ngOnInit(): void {
    this.isEditMode = !!this.empleadoParaEditar;
    this.initForm();
    this.loadServices();
  }

  private initForm(): void {
    this.empleadoForm = this.fb.group({
      nombre: [this.empleadoParaEditar?.usuario.nombre || '', Validators.required],
      email: [this.empleadoParaEditar?.usuario.email || '', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      username: [this.empleadoParaEditar?.usuario.username || ''],
      rol: [this.empleadoParaEditar?.usuario.rol || 'terapeuta', Validators.required],
      especialidad: [this.empleadoParaEditar?.especialidad || '', Validators.required],
      activo: [this.empleadoParaEditar ? this.empleadoParaEditar.activo : true],
    });

    if (this.isEditMode && this.empleadoParaEditar) {
      this.empleadoParaEditar.servicios.forEach((s: Servicio) => this.serviciosAsignados.add(s.id));
    }
  }

  private loadServices(): void {
    this.serviciosService.getServicios().subscribe(data => {
      this.allServices.set(data.filter(s => s.activo));
    });
  }

  onServiceChange(servicioId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.serviciosAsignados.add(servicioId);
    } else {
      this.serviciosAsignados.delete(servicioId);
    }
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.empleadoForm.value;

    if (this.isEditMode && this.empleadoParaEditar) {
      const empId = this.empleadoParaEditar.id;
      const serviciosIds = Array.from(this.serviciosAsignados);

      forkJoin([
        this.empleadosService.updateEmpleado(empId, {
          especialidad: formValue.especialidad,
          activo: formValue.activo,
        }),
        this.empleadosService.replaceServicios(empId, serviciosIds),
      ]).pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.empleadoGuardado.emit();
          this.closeModal.emit();
        },
        error: (err) => {
          this.submitError.set(err.error?.message || 'Error al actualizar el empleado.');
        }
      });
    } else {
      const payload: EmpleadoPayload = {
        usuario: {
          nombre: formValue.nombre,
          email: formValue.email,
          password: formValue.password,
          username: formValue.username || undefined,
          rol: formValue.rol,
        },
        especialidad: formValue.especialidad,
        activo: formValue.activo,
        serviciosIds: Array.from(this.serviciosAsignados),
      };

      this.empleadosService.createEmpleado(payload)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: () => {
            this.empleadoGuardado.emit();
            this.closeModal.emit();
          },
          error: (err) => {
            this.submitError.set(err.error?.message || 'Error al crear el empleado.');
          }
        });
    }
  }
}
