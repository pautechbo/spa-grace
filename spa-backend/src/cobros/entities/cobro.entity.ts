/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
// Corregimos la ruta de importación
import { Turno } from '../../turnos/entities/turno.entity';

@Entity('cobros')
export class Cobro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  monto_adelanto: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    asExpression: '(monto_total - monto_adelanto)',
    generatedType: 'STORED',
  })
  monto_pendiente: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodo_pago_adelanto: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodo_pago_final: string;

  @Column({ type: 'datetime', nullable: true })
  fecha_adelanto: Date;

  @Column({ type: 'datetime', nullable: true })
  fecha_cobro_final: Date;

  @Column({
    type: 'enum',
    enum: [
      'pendiente_adelanto',
      'adelanto_pagado',
      'pagado_completo',
      'cancelado',
      'reembolsado',
    ],
    default: 'pendiente_adelanto',
  })
  estado_pago: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  // --- Relaciones ---
  // Un Cobro está asociado a un único Turno.
  @OneToOne(() => Turno, { nullable: false })
  @JoinColumn({ name: 'id_turno' })
  turno: Turno;
}

