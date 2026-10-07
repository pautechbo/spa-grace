/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Turno } from 'src/turnos/entities/turno.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';

@Entity('servicios')
export class Servicio {
  // ... (columnas existentes: id, nombre, etc.)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column()
  duracion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ name: 'parent_servicio_id', nullable: true })
  parent_servicio_id: number;

  @ManyToOne(() => Servicio, servicio => servicio.hijos)
  @JoinColumn({ name: 'parent_servicio_id' })
  parentServicio: Servicio | null;

  @OneToMany(() => Servicio, servicio => servicio.parentServicio)
  hijos: Servicio[];

  @Column({ nullable: true })
  imagen_url: string;

  @Column({ default: true })
  activo: boolean;

  // Añadimos la relación inversa con Turno
  @ManyToMany(() => Turno, (turno) => turno.servicios)
  turnos: Turno[];

  @ManyToMany(() => Empleado, (empleado) => empleado.servicios)
  empleados: Empleado[];
}

