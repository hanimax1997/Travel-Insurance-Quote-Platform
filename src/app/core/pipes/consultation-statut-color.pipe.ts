import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statutColor',
  standalone: true
})
export class ConsultationStatutColorPipe implements PipeTransform {

  transform(statut: number): string {
    let color: string;
    console.log("statut ", statut)
    switch (statut) {
      case 109: // actif
        color = '#a6bbab'
        break;
      case 240: // actif
        color = '#a6bbab'
        break;
      case 110: // en attente
        color = '#e79a71'
        break;
      case 111: // refusé
        color = '#db6564'
        break;
      case 243: // transforme
        color = '#8cacd3'
        break;

      default: 
        color = 'grey';
    }

    return 'background: ' + color + '; color: white;';
  }

}
