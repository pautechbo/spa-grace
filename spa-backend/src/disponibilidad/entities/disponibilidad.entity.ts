/* eslint-disable prettier/prettier */
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('disponibilidad_empleados')
export class Disponibilidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
      'domingo',
    ],
  })
  dia_semana: string;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // --- Relaciones ---
  @ManyToOne(() => Empleado, { nullable: false })
  @JoinColumn({ name: 'id_empleado' })
  empleado: Empleado;
}
