/* eslint-disable prettier/prettier */
import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// El decorador @Entity le dice a TypeORM que esta clase es un modelo
// que se corresponde con una tabla en la base de datos.
// El nombre de la tabla será 'user' por defecto, pero podemos cambiarlo a 'usuarios'.
@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  // Hacemos que el email sea único para evitar registros duplicados.
  @Column({ unique: true })
  email: string;

  // Usamos Exclude para asegurarnos de que la contraseña NUNCA se envíe
  // en las respuestas de la API, incluso si la seleccionamos por accidente.
  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'recepcionista', 'terapeuta', 'cliente'],
    default: 'cliente',
  })
  rol: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  telefono: string;

  // @CreateDateColumn es un decorador especial que TypeORM
  // llena automáticamente con la fecha y hora de creación.
  @CreateDateColumn()
  fecha_registro: Date;
}
