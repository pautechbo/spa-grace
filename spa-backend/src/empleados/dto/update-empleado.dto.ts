import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  especialidad?: string;

  @IsOptional()
  activo?: any;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  serviciosIds?: number[];
}
