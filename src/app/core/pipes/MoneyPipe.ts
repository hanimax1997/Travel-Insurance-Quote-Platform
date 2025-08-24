import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'money',
  standalone: true
})
export class MoneyPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    if (value !== undefined && value !== null) {
      // here we just remove the commas from value
      return value.toString().replace(/,/g, " ");
    } else {
      return value
      .toString()
      .replace(/[.,]/g, '\u00A0')
      .trim();
    }  }

}