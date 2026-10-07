import { User } from './users/entities/user.entity';
import { Turno } from './turnos/entities/turno.entity';
import { HistorialClinico } from './historiales/entities/historial.entity';
import { Servicio } from './servicios/entities/servicio.entity';
import { Promocion } from './promociones/entities/promocion.entity';
import { Empleado } from './empleados/entities/empleado.entity';
import { Asistencia } from './asistencia/entities/asistencia.entity';
import { PagoEmpleado } from './pagos-empleados/entities/pago-empleado.entity';
import { Disponibilidad } from './disponibilidad/entities/disponibilidad.entity';
import { Cobro } from './cobros/entities/cobro.entity';

/**
 * Registro explícito de entidades.
 *
 * `app.module.ts` usaba antes un globo sobre el directorio de salida.
 * Ese patrón funciona en local (los `.js` compilados siguen siendo ficheros
 * sueltos en `dist/`), pero NO en un bundle serverless de Vercel: todo se
 * empaqueta en un único fichero y el globo no encuentra nada, lo que hace
 * fallar el arranque con "No entities were found".
 *
 * Al listarlas a mano el mismo registro sirve en ambos entornos.
 *
 * Al añadir una entidad nueva hay que importarla y añadirla aquí.
 */
export const ENTITIES = [
  User,
  Turno,
  HistorialClinico,
  Servicio,
  Promocion,
  Empleado,
  Asistencia,
  PagoEmpleado,
  Disponibilidad,
  Cobro,
];
