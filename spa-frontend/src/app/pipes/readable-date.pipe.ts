import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readableDate',
  standalone: true
})
export class ReadableDatePipe implements PipeTransform {

  transform(value: { fecha: string, hora: string }): string {
    if (!value || !value.fecha || !value.hora) {
      return '';
    }

    try {
      const dias = ['domingo','lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      // Creamos un objeto de fecha combinando la fecha y la hora
      const fechaCompleta = new Date(`${value.fecha}T${value.hora}`);

      const diaSemana = dias[fechaCompleta.getDay()];
      const diaMes = fechaCompleta.getDate();
      const mes = meses[fechaCompleta.getMonth()];

      let hora = fechaCompleta.getHours();
      const minutos = fechaCompleta.getMinutes();
      let periodo = '';

      if (hora >= 5 && hora < 12) {
        periodo = 'de la mañana';
      } else if (hora === 12) {
        periodo = 'del mediodía';
      } else if (hora > 12 && hora < 20) {
        hora = hora - 12; // Convertir a formato 12 horas
        periodo = 'de la tarde';
      } else {
        if (hora !== 0) hora = hora - 12;
        if (hora === 0) hora = 12;
        periodo = 'de la noche';
      }

      const horaFormateada = `${hora}${minutos > 0 ? ':' + minutos.toString().padStart(2, '0') : ''}`;

      return `${diaSemana} ${diaMes} de ${mes} a las ${horaFormateada} ${periodo}`;
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return `${value.fecha} - ${value.hora}`; // Devolver el original si hay un error
    }
  }
}
