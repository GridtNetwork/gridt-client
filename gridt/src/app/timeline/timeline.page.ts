import { Component, OnInit } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { MovementsService } from '../movements/movement.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {
  movements: Movement[];
  movement: Movement;
  constructor(private movementsService: MovementsService) { }
  

  ngOnInit() {
    this.movements = this.movementsService.movements;
  }

  get filterBySubscribed() {
    return this.movements.filter(movement => movement.subscribed);
  }


}
