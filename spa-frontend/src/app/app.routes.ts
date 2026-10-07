import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './layouts/dashboard/dashboard.component';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { authGuard } from './guards/auth.guard';
import { AgendaComponent } from './pages/dashboard/agenda/agenda.component';
import { ServiciosComponent } from './pages/dashboard/servicios/servicios.component';
import { PersonalComponent } from './pages/dashboard/personal/personal.component';
import { CobrosComponent } from './pages/dashboard/cobros/cobros.component';
import { MisTurnosComponent } from './pages/dashboard/mis-turnos/mis-turnos.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'agenda', component: AgendaComponent },
            { path: 'cobros', component: CobrosComponent },
            { path: 'servicios', component: ServiciosComponent },
            { path: 'personal', component: PersonalComponent },
            { path: 'mis-turnos', component: MisTurnosComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' },
        ]
    },
];
