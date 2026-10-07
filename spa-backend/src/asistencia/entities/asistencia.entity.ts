import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empleado } from 'src/empleados/entities/empleado.entity';

@Entity('asistencias')
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Empleado, { nullable: false })
  @JoinColumn({ name: 'id_empleado' })
  empleado: Empleado;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora_entrada: string;

  @Column({ type: 'time', nullable: true })
  hora_salida: string;
}
