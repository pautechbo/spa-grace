/* eslint-disable prettier/prettier */
import { Turno } from 'src/turnos/entities/turno.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('historiales_clinicos')
export class HistorialClinico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  tratamiento: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  archivo_url: string;

  // --- Relaciones ---

  // Un historial pertenece a un Cliente (que es un Usuario).
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_cliente' })
  cliente: User;

  // Un historial puede estar asociado a un Turno específico.
  @ManyToOne(() => Turno, { nullable: true })
  @JoinColumn({ name: 'id_turno' })
  turno: Turno;
}
