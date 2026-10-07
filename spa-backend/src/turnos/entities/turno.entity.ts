/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { Cobro } from '../../cobros/entities/cobro.entity';


@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_cliente' })
  cliente!: User;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'id_empleado' })
  empleado!: Empleado;

  @ManyToMany(() => Servicio)
  @JoinTable({
    name: 'turnos_servicios',
    joinColumn: { name: 'turnoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'servicioId', referencedColumnName: 'id' },
  })
  servicios!: Servicio[];

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'time' })
  hora!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_servicio_base!: number;
  
  @Column({
    type: 'enum',
    enum: ['pendiente', 'confirmado', 'cancelado', 'atendido', 'ausente', 'reprogramado'],
    default: 'pendiente'
  })
  estado!: string;
  
  @OneToMany(() => Cobro, (cobro) => cobro.turno)
  cobros!: Cobro[];

  @Column({ type: 'text', nullable: true })
  notas_turno!: string;

  @Column({ type: 'timestamp', nullable: true })
  atendido_exitoso?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion!: Date;
}
