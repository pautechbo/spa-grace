import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  @Column({ nullable: true })
  especialidad: string;

  @Column({ default: true })
  activo: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToMany(() => Servicio, (servicio) => servicio.empleados)
  @JoinTable({
    name: 'empleados_servicios',
    joinColumn: { name: 'id_empleado', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_servicio', referencedColumnName: 'id' },
  })
  servicios: Servicio[];
}
