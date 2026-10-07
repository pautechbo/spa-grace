/* eslint-disable prettier/prettier */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary-by-status')
  @Roles('admin', 'recepcionista')
  getTurnosSummaryByStatus() {
    return this.reportsService.getTurnosSummaryByStatus();
  }

  @Get('income')
  @Roles('admin', 'recepcionista')
  getIncomeReport(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.reportsService.getIncomeReport(fechaInicio, fechaFin);
  }

  @Get('popular-services')
  @Roles('admin', 'recepcionista')
  getPopularServices() {
    return this.reportsService.getPopularServices();
  }
}
