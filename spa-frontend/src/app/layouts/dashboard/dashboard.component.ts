import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  public isLogoutConfirmOpen = signal<boolean>(false);
  public isMobileMenuOpen = signal(false);

  get isAdmin(): boolean {
    return this.authService.currentUser()?.rol === 'admin';
  }

  get isStaff(): boolean {
    const r = this.authService.currentUser()?.rol;
    return r === 'terapeuta' || r === 'recepcionista';
  }

  get isClient(): boolean {
    return this.authService.currentUser()?.rol === 'cliente';
  }

  get navItems() {
    if (this.isAdmin) {
      return [
        { path: '/dashboard/home', label: 'Inicio', icon: 'fa-chart-pie' },
        { path: '/dashboard/agenda', label: 'Agenda', icon: 'fa-calendar-days' },
        { path: '/dashboard/cobros', label: 'Cobros', icon: 'fa-credit-card' },
        { path: '/dashboard/servicios', label: 'Servicios', icon: 'fa-spa' },
        { path: '/dashboard/personal', label: 'Personal', icon: 'fa-users' },
      ];
    }
    if (this.isStaff) {
      return [
        { path: '/dashboard/home', label: 'Inicio', icon: 'fa-chart-pie' },
        { path: '/dashboard/agenda', label: 'Agenda', icon: 'fa-calendar-days' },
      ];
    }
    return [
      { path: '/dashboard/home', label: 'Inicio', icon: 'fa-house' },
      { path: '/dashboard/mis-turnos', label: 'Mis Turnos', icon: 'fa-clipboard-list' },
    ];
  }

  askForLogout(): void {
    this.isLogoutConfirmOpen.set(true);
  }

  confirmLogout(): void {
    this.authService.logout();
    this.isLogoutConfirmOpen.set(false);
  }
}
