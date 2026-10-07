import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Servicio, ServicioPayload, ServiciosService } from '../../services/servicios.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicio-form.component.html',
})
export class ServicioFormComponent implements OnInit {
  @Input() servicioParaEditar: Servicio | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() servicioGuardado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private serviciosService = inject(ServiciosService);

  servicioForm!: FormGroup;
  isEditMode = false;

// --- Lógica Mejorada para la Búsqueda ---
  parentServiceSearchCtrl = new FormControl('');
  searchTerm = signal('');
  serviciosPrincipales = signal<Servicio[]>([]);
  showResults = signal(false);

  filteredServices = computed(() => {
    const term = this.searchTerm();
    const services = this.serviciosPrincipales();
    if (!term) return services;
    return services.filter(s => s.nombre.toLowerCase().includes(term));
  });

  selectedParentService = computed(() => {
    const id = this.servicioForm?.get('parent_servicio_id')?.value;
    if (!id) return null;
    return this.serviciosPrincipales().find(s => s.id === id) || null;
  });


  ngOnInit(): void {
    this.isEditMode = !!this.servicioParaEditar;
    this.initForm();
    this.loadServiciosPrincipales();
    this.setupConditionalValidation();

    // Conectamos el input a la señal de búsqueda
    this.parentServiceSearchCtrl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value?.toLowerCase() || '');
      this.showResults.set(true);
    });
  }

  private initForm(): void {
    this.servicioForm = this.fb.group({
      // Nuevo control para el tipo de servicio
      tipoServicio: [this.servicioParaEditar?.parent_servicio_id ? 'addon' : 'principal', Validators.required],
      nombre: [this.servicioParaEditar?.nombre || '', Validators.required],
      descripcion: [this.servicioParaEditar?.descripcion || ''],
      duracion: [this.servicioParaEditar?.duracion || 0, [Validators.required, Validators.min(1)]],
      precio: [this.servicioParaEditar?.precio || 0, [Validators.required, Validators.min(0)]],
      parent_servicio_id: [this.servicioParaEditar?.parent_servicio_id || null],
      activo: [this.servicioParaEditar ? this.servicioParaEditar.activo : true, Validators.required],
    });
  }

  private loadServiciosPrincipales(): void {
    this.serviciosService.getServicios().subscribe(servicios => {
      const principales = servicios.filter(s => !s.parent_servicio_id && s.id !== this.servicioParaEditar?.id);
      this.serviciosPrincipales.set(principales);

      if (this.isEditMode && this.servicioParaEditar?.parent_servicio_id) {
        const parent = servicios.find(s => s.id === this.servicioParaEditar!.parent_servicio_id);
        if (parent) {
          this.parentServiceSearchCtrl.setValue(parent.nombre);
        }
      }
    });
  }

  // Este método maneja el evento 'blur' del campo de búsqueda.
  onSearchBlur(): void {
    setTimeout(() => this.showResults.set(false), 200);
  }

  selectParentService(servicio: Servicio): void {
    this.servicioForm.get('parent_servicio_id')?.setValue(servicio.id);
    this.parentServiceSearchCtrl.setValue(servicio.nombre);
    this.showResults.set(false);
  }

  clearParentService(): void {
    this.servicioForm.get('parent_servicio_id')?.setValue(null);
    this.parentServiceSearchCtrl.setValue('');
  }
  // Lógica para hacer el campo 'parent_servicio_id' obligatorio condicionalmente
  private setupConditionalValidation(): void {
    const tipoServicioControl = this.servicioForm.get('tipoServicio');
    const parentServicioControl = this.servicioForm.get('parent_servicio_id');

    tipoServicioControl?.valueChanges.subscribe(tipo => {
      if (tipo === 'addon') {
        parentServicioControl?.setValidators([Validators.required]);
      } else {
        parentServicioControl?.clearValidators();
        parentServicioControl?.setValue(null); // Limpiar el valor si se cambia a principal
      }
      parentServicioControl?.updateValueAndValidity();
    });

    // Ejecutar una vez al inicio para establecer el estado correcto
    tipoServicioControl?.updateValueAndValidity();
  }


  onSubmit(): void {
    if (this.servicioForm.invalid) {
      return;
    }

    const payload: ServicioPayload = this.servicioForm.value;

    if (this.isEditMode && this.servicioParaEditar) {
      this.serviciosService.updateServicio(this.servicioParaEditar.id, payload).subscribe(() => {
        this.servicioGuardado.emit();
        this.closeModal.emit();
      });
    } else {
      this.serviciosService.createServicio(payload).subscribe(() => {
        this.servicioGuardado.emit();
        this.closeModal.emit();
      });
    }
  }
}

