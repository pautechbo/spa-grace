/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Cobro } from 'src/cobros/entities/cobro.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Repository } from 'typeorm';

interface ITurnosSummary {
  estado: string;
  total: string;
}

export interface IFormattedSummary {
  [key: string]: number;
}

export interface IncomeReport {
  total_ingresos: number;
  total_adelantos: number;
  total_pendiente: number;
  cantidad_turnos: number;
}

export interface PopularService {
  nombre: string;
  cantidad: number;
  total_generado: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    @InjectRepository(Cobro)
    private readonly cobroRepository: Repository<Cobro>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
  ) {}

  async getTurnosSummaryByStatus(): Promise<IFormattedSummary> {
    const summary: ITurnosSummary[] = await this.turnoRepository
      .createQueryBuilder('turno')
      .select('turno.estado', 'estado')
      .addSelect('COUNT(turno.id)', 'total')
      .groupBy('turno.estado')
      .getRawMany();

    return summary.reduce((acc: IFormattedSummary, item) => {
      acc[item.estado] = parseInt(item.total, 10);
      return acc;
    }, {});
  }

  async getIncomeReport(fechaInicio?: string, fechaFin?: string): Promise<IncomeReport> {
    const query = this.cobroRepository
      .createQueryBuilder('cobro')
      .select('COALESCE(SUM(cobro.monto_total), 0)', 'total_ingresos')
      .addSelect('COALESCE(SUM(cobro.monto_adelanto), 0)', 'total_adelantos');

    if (fechaInicio && fechaFin) {
      query.where('cobro.fecha_cobro_final BETWEEN :inicio AND :fin', {
        inicio: fechaInicio,
        fin: fechaFin,
      });
    }

    const income = await query.getRawOne();
    const countQuery = await this.cobroRepository.count();

    return {
      total_ingresos: Number(income?.total_ingresos || 0),
      total_adelantos: Number(income?.total_adelantos || 0),
      total_pendiente: Number(income?.total_ingresos || 0) - Number(income?.total_adelantos || 0),
      cantidad_turnos: countQuery,
    };
  }

  async getPopularServices(): Promise<PopularService[]> {
    const servicios = await this.servicioRepository
      .createQueryBuilder('servicio')
      .leftJoin('servicio.turnos', 'turno')
      .select('servicio.nombre', 'nombre')
      .addSelect('COUNT(turno.id)', 'cantidad')
      .addSelect('COALESCE(SUM(turno.precio_servicio_base), 0)', 'total_generado')
      .groupBy('servicio.id')
      .orderBy('cantidad', 'DESC')
      .getRawMany();

    return servicios.map(s => ({
      nombre: s.nombre,
      cantidad: Number(s.cantidad),
      total_generado: Number(s.total_generado),
    }));
  }
}
