import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  // Importamos TypeOrmModule.forFeature([User]) para que el módulo
  // pueda inyectar el repositorio de la entidad User.
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  // ¡Importante! Exportamos el servicio para que otros módulos (como AuthModule) puedan usarlo.
  exports: [UsersService],
})
export class UsersModule {}
