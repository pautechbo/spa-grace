/* eslint-disable prettier/prettier */
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('pagos_empleados')
export class PagoEmpleado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha_pago: Date;

  @Column({ type: 'date' })
  periodo_inicio: Date;

  @Column({ type: 'date' })
  periodo_fin: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_bruto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  deducciones: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    asExpression: '(monto_bruto - deducciones)',
    generatedType: 'STORED',
  })
  monto_neto: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  metodo_pago: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia_pago: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  // --- Relaciones ---
  @ManyToOne(() => Empleado, { nullable: false })
  @JoinColumn({ name: 'id_empleado' })
  empleado: Empleado;
}
