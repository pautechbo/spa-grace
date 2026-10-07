/* eslint-disable prettier/prettier */
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('promociones')
export class Promocion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen_url: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigo_descuento: string;

  @Column({ type: 'enum', enum: ['porcentaje', 'fijo'], nullable: true })
  tipo_descuento: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valor_descuento: number;

  @Column({
    type: 'enum',
    enum: ['todos', 'servicio_especifico', 'categoria', 'cumpleanos'],
    default: 'todos',
  })
  aplica_a: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;

  // --- Relaciones ---
  @ManyToOne(() => Servicio, { nullable: true })
  @JoinColumn({ name: 'id_servicio_aplicable' })
  servicioAplicable: Servicio;

  // --- NUEVA RELACIÓN ---
  // Una promoción es creada por un Usuario.
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creado_por_id' }) // Asumimos que esta columna existe en la BD
  creadoPor: User;
}
