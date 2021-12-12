import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'data'
})
export class DataPipe implements PipeTransform {
  months = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nentor", "Dhjetor"];
  transform(value: string, ...args: unknown[]): unknown {
    const dateData = value.split("/");
    var monthValue = Number(dateData[1].substring(1));  
    return `${dateData[0]}/${this.months[monthValue - 1]}/${dateData[2]}`;
  }

}
