import { Pipe, PipeTransform } from '@angular/core';
import { Movement } from '../core/models/movement.model';

@Pipe({
  name: 'movementFilter'
})
export class MovementsFilterPipe implements PipeTransform {
  transform(movements: Movement[], searchText: string): Movement[] {
    if(!movements) return [];
    if(!searchText) return movements;
    searchText = searchText.toLowerCase();
    return movements.filter( m => {
      return m.name.toLowerCase().includes(searchText) || m.short_description.toLowerCase().includes(searchText);
    });
   }
}
