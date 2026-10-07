/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { User } from 'src/users/entities/user.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  // Importamos tanto Empleado como User para que el servicio
  // pueda usar ambos repositorios.
  imports: [
    TypeOrmModule.forFeature([Empleado, User, Servicio]),
    UsersModule,
  ],
    
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
})
export class EmpleadosModule {}
