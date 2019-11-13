import { Component, OnInit, OnDestroy } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { Subscription } from 'rxjs';
import { MovementsService } from '../movements/movements.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit, OnDestroy {
  
  movements: Movement[];
  isLoading = false;
 private sub: Subscription;
  constructor(private movementsService: MovementsService) {  }
  

  ngOnInit() {
    console.log('hello');
    this.sub = this.movementsService.movements.subscribe(movements => {
      this.movements = movements;
   });
  }

  get filterBySubscribed() {
    return this.movementsService.movements.subscribe(movements => {
      this.movements= movements;
      return this.movements.filter(movement => movement.subscribed );
    }
      );
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
