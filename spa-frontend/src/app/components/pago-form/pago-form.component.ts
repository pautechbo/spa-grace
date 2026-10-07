import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turno } from '../../services/turnos.service';
import { CobrosService, PagoPayload } from '../../services/cobros.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-form.component.html',
})
export class PagoFormComponent {
  @Input({ required: true }) turno!: Turno;
  @Output() closeModal = new EventEmitter<void>();
  @Output() pagoRegistrado = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private cobrosService = inject(CobrosService);

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  pagoForm: FormGroup;

  constructor() {
    this.pagoForm = this.fb.group({
      monto_pago: [0, [Validators.required, Validators.min(0.01)]],
      metodo_pago: ['Efectivo', Validators.required],
      es_pago_final: [false]
    });
  }

  get cobro() {
    return this.turno.cobros?.[0] ?? null;
  }

  get montoMaximo(): number {
    if (!this.cobro) return 0;
    return Number(this.cobro.monto_total) - Number(this.cobro.monto_adelanto);
  }

  onSubmit(): void {
    if (this.pagoForm.invalid || !this.cobro) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const formValue = this.pagoForm.value;
    const esPagoFinal = formValue.es_pago_final || this.montoMaximo <= formValue.monto_pago;

    let payload: Partial<PagoPayload>;

    if (this.cobro.estado_pago === 'pendiente_adelanto' && !esPagoFinal) {
      payload = {
        estado_pago: 'adelanto_pagado',
        monto_adelanto: formValue.monto_pago,
        metodo_pago_adelanto: formValue.metodo_pago,
      };
    } else {
      const updateData: Partial<PagoPayload> = {
        estado_pago: 'pagado_completo',
      };
      if (this.cobro.estado_pago === 'pendiente_adelanto') {
        updateData.monto_adelanto = formValue.monto_pago;
        updateData.metodo_pago_adelanto = formValue.metodo_pago;
      } else {
        updateData.metodo_pago_final = formValue.metodo_pago;
      }
      payload = updateData;
    }

    this.cobrosService.updateCobro(this.cobro.id, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.pagoRegistrado.emit();
          this.closeModal.emit();
        },
        error: (err) => {
          this.submitError.set(err.error?.message || 'Error al registrar el pago.');
        }
      });
  }
}
