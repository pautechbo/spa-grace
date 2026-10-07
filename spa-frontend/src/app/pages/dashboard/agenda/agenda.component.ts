import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TurnosService, Turno } from '../../../services/turnos.service';
import { CobrosService } from '../../../services/cobros.service';
import { AuthService } from '../../../services/auth.service';
import { ReadableDatePipe } from '../../../pipes/readable-date.pipe';
import { TurnoFormComponent } from '../../../components/turno-form/turno-form.component';
import { PagoFormComponent } from '../../../components/pago-form/pago-form.component';
import { HistorialModalComponent } from '../../../components/historial-modal/historial-modal.component';
import { debounceTime } from 'rxjs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReadableDatePipe, TurnoFormComponent, PagoFormComponent, HistorialModalComponent, FullCalendarModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  @ViewChild(TurnoFormComponent) turnoFormComponent?: TurnoFormComponent;
  @ViewChild('actionsMenuContainer') actionsMenuContainer?: ElementRef;

  private turnosService = inject(TurnosService);
  private cobrosService = inject(CobrosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  viewMode = signal<'calendar' | 'table'>('calendar');

  searchControl = new FormControl('');
  private searchTerm = signal('');

  allTurnos = signal<Turno[]>([]);
  isLoading = signal<boolean>(true);
  isConfirmModalOpen = signal<boolean>(false);
  isTurnoModalOpen = signal<boolean>(false);
  isPagoModalOpen = signal<boolean>(false);
  isHistorialModalOpen = signal<boolean>(false);
  clienteHistorial = signal<{ id: number; nombre: string } | null>(null);
  turnoSeleccionado = signal<Turno | null>(null);
  currentView = signal<'activos' | 'atendidos' | 'cancelados'>('activos');
  openMenuId = signal<number | null>(null);
  notification = signal<{ message: string, type: 'success' | 'error' } | null>(null);
  confirmAction: { message: string, onConfirm: () => void } | null = null
  recentlyAddedTurnoId = signal<number | null>(null);

  pageSize = signal(7);
  currentPage = signal(1);

  esTerapeuta = computed(() => this.authService.currentUser()?.rol === 'terapeuta');
  esAdmin = computed(() => this.authService.currentUser()?.rol === 'admin');
  esRecepcionista = computed(() => this.authService.currentUser()?.rol === 'recepcionista');

  initialDateSignal = signal<{ fecha: string, hora: string } | null>(null);
  turnoAccionCalendar = signal<Turno | null>(null);
  calendarPopupPos = signal<{ x: number, y: number } | null>(null);

  turnosActivos = computed(() => this.allTurnos().filter(t => t.estado === 'pendiente' || t.estado === 'confirmado' || t.estado === 'reprogramado'));
  turnosAtendidos = computed(() => this.allTurnos().filter(t => t.estado === 'atendido'));
  turnosCancelados = computed(() => this.allTurnos().filter(t => t.estado === 'cancelado' || t.estado === 'ausente'));

  private filteredTurnos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allTurnos();
    return this.allTurnos().filter(turno =>
      turno.cliente.nombre.toLowerCase().includes(term) ||
      turno.empleado?.usuario?.nombre.toLowerCase().includes(term) ||
      turno.servicios.some(s => s.nombre.toLowerCase().includes(term))
    );
  });

  private currentList = computed(() => {
    switch (this.currentView()) {
      case 'activos': return this.turnosActivos();
      case 'atendidos': return this.turnosAtendidos();
      case 'cancelados': return this.turnosCancelados();
    }
  });

  paginatedTurnos = computed(() => {
    const list = this.currentList();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });

  totalPages = computed(() => {
    const list = this.currentList();
    if (list.length === 0) return 1;
    return Math.ceil(list.length / this.pageSize());
  });

  estadoColors: Record<string, string> = {
    pendiente: '#facc15',
    confirmado: '#3b82f6',
    atendido: '#22c55e',
    cancelado: '#ef4444',
    ausente: '#9ca3af',
    reprogramado: '#a855f7',
  };

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: this.allTurnos().map(t => ({
      id: String(t.id),
      title: `${t.cliente.nombre} - ${t.servicios.map(s => s.nombre).join(', ')}`,
      start: `${t.fecha}T${t.hora}`,
      backgroundColor: this.estadoColors[t.estado] || '#6b7280',
      borderColor: this.estadoColors[t.estado] || '#6b7280',
      textColor: t.estado === 'pendiente' ? '#000' : '#fff',
      extendedProps: { turno: t },
    })),
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    selectable: true,
    select: this.handleSelect.bind(this),
    height: 'auto',
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    allDaySlot: false,
    slotDuration: '00:30:00',
  }));

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openMenuId() && !this.actionsMenuContainer?.nativeElement.contains(event.target)) {
      this.openMenuId.set(null);
    }
    const target = event.target as HTMLElement;
    if (this.turnoAccionCalendar() && !target.closest('.calendar-popup') && !target.closest('.fc-event')) {
      this.cerrarPopupCalendar();
    }
  }

  ngOnInit(): void {
    if (this.authService.currentUser()?.rol === 'terapeuta') {
      this.viewMode.set('table');
    }
    this.loadTurnos();
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.searchTerm.set(value || '');
      this.currentPage.set(1);
    });
  }

  loadTurnos(): void {
    this.isLoading.set(true);
    const user = this.authService.currentUser();
    const empleadoId = user?.rol === 'terapeuta' ? user.id_empleado : undefined;
    this.turnosService.getTurnos(undefined, empleadoId).subscribe({
      next: (data) => this.allTurnos.set(data),
      error: (err) => console.error('Error al cargar los turnos', err)
    }).add(() => this.isLoading.set(false));
  }

  private handleDateClick(arg: { dateStr: string }): void {
    this.initialDateSignal.set({ fecha: arg.dateStr, hora: '09:00' });
    this.turnoSeleccionado.set(null);
    this.isTurnoModalOpen.set(true);
  }

  private handleSelect(arg: DateSelectArg): void {
    const fecha = arg.startStr.split('T')[0];
    const hora = arg.startStr.split('T')[1]?.substring(0, 5) || '09:00';
    this.initialDateSignal.set({ fecha, hora });
    this.turnoSeleccionado.set(null);
    this.isTurnoModalOpen.set(true);
  }

  private handleEventClick(arg: EventClickArg): void {
    const turno = arg.event.extendedProps['turno'] as Turno;
    if (turno) {
      this.turnoAccionCalendar.set(turno);
      this.calendarPopupPos.set({ x: arg.jsEvent.clientX, y: arg.jsEvent.clientY });
    }
  }

  cerrarPopupCalendar(): void {
    this.turnoAccionCalendar.set(null);
    this.calendarPopupPos.set(null);
  }

  getDropdownTop(): number {
    return 180;
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 4000);
  }

  handleTurnoGuardado(turnoGuardado: Turno): void {
    const isEdit = this.turnoSeleccionado() !== null;
    this.loadTurnos();
    const message = isEdit
      ? `Turno para ${turnoGuardado.cliente.nombre} actualizado.`
      : `Turno para ${turnoGuardado.cliente.nombre} agendado con éxito.`;
    this.showNotification(message, 'success');
    if (!isEdit) {
      this.recentlyAddedTurnoId.set(turnoGuardado.id);
      setTimeout(() => this.recentlyAddedTurnoId.set(null), 5000);
    }
  }

  askForDelete(turno: Turno) {
    this.confirmAction = {
      message: `¿Estás seguro de que quieres eliminar el turno de ${turno.cliente.nombre}?`,
      onConfirm: () => this.deleteTurno(turno.id)
    };
    this.isConfirmModalOpen.set(true);
    this.openMenuId.set(null);
  }

  confirmAndDelete() {
    this.confirmAction?.onConfirm();
    this.isConfirmModalOpen.set(false);
  }

  deleteTurno(id: number) {
    this.turnosService.deleteTurno(id).subscribe({
      next: () => {
        this.loadTurnos();
        this.showNotification('Turno eliminado con éxito.', 'success');
      },
      error: (err) => this.showNotification('Error al eliminar el turno.', 'error')
    });
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.setPageSize(Number(target.value));
    }
  }

  cancelarTurno(turnoId: number): void {
    this.turnosService.updateTurnoStatus(turnoId, 'cancelado').subscribe({
      next: () => {
        this.loadTurnos();
        this.showNotification('Turno cancelado.', 'success');
      },
      error: (err) => this.showNotification('Error al cancelar el turno.', 'error')
    });
    this.openMenuId.set(null);
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  changeView(view: 'activos' | 'atendidos' | 'cancelados') {
    this.currentView.set(view);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  toggleMenu(turnoId: number): void {
    this.openMenuId.set(this.openMenuId() === turnoId ? null : turnoId);
  }

  openTurnoModalParaCrear(): void {
    this.initialDateSignal.set(null);
    this.turnoSeleccionado.set(null);
    this.isTurnoModalOpen.set(true);
  }

  openTurnoModalParaEditar(turno: Turno): void {
    this.initialDateSignal.set(null);
    this.turnoSeleccionado.set(turno);
    this.isTurnoModalOpen.set(true);
    this.openMenuId.set(null);
  }

  openPagoModal(turno: Turno): void {
    this.turnoSeleccionado.set(turno);
    this.isPagoModalOpen.set(true);
    this.openMenuId.set(null);
  }

  openHistorialModal(turno: Turno): void {
    this.clienteHistorial.set({ id: turno.cliente.id, nombre: turno.cliente.nombre });
    this.isHistorialModalOpen.set(true);
    this.cerrarPopupCalendar();
    this.openMenuId.set(null);
  }

  closeModals(): void {
    this.isTurnoModalOpen.set(false);
    this.isPagoModalOpen.set(false);
    this.isHistorialModalOpen.set(false);
    this.clienteHistorial.set(null);
    this.turnoSeleccionado.set(null);
  }

  handlePagoRegistrado(): void {
    this.loadTurnos();
  }

  confirmarTurno(turnoId: number): void {
    this.turnosService.updateTurnoStatus(turnoId, 'confirmado').subscribe({
      next: () => {
        this.loadTurnos();
        this.showNotification('Turno confirmado.', 'success');
      },
      error: (err) => this.showNotification('Error al confirmar el turno.', 'error')
    });
    this.openMenuId.set(null);
  }

  marcarAtendido(turnoId: number): void {
    this.turnosService.updateTurnoStatus(turnoId, 'atendido').subscribe({
      next: () => this.loadTurnos(),
      error: (err) => console.error('Error al marcar como atendido', err)
    });
    this.openMenuId.set(null);
  }

  marcarAusente(turnoId: number): void {
    this.turnosService.updateTurnoStatus(turnoId, 'ausente').subscribe({
      next: () => this.loadTurnos(),
      error: (err) => console.error('Error al marcar como ausente', err)
    });
    this.openMenuId.set(null);
  }

  onBackdropClick(): void {
    if (this.turnoFormComponent?.turnoForm.pristine) {
      this.closeModals();
    }
  }

  askForReimbursement(turno: Turno) {
    const cobro = turno.cobros[0];
    this.confirmAction = {
      message: `¿Estás seguro de que quieres reembolsar el adelanto de ${cobro.monto_adelanto} Bs. para el turno de ${turno.cliente.nombre}?`,
      onConfirm: () => this.confirmAndReimburse(cobro.id)
    };
    this.isConfirmModalOpen.set(true);
    this.openMenuId.set(null);
  }

  confirmAndReimburse(cobroId: number) {
    this.cobrosService.reembolsarAdelanto(cobroId).subscribe({
      next: () => {
        this.loadTurnos();
        this.showNotification('Adelanto reembolsado con éxito.', 'success');
      },
      error: (err) => {
        this.showNotification('Error al procesar el reembolso.', 'error');
        console.error(err);
      }
    });
    this.isConfirmModalOpen.set(false);
  }
}
