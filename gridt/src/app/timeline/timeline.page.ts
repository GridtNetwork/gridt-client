import { Component, OnInit, OnDestroy } from '@angular/core';
import { Movement } from 'src/api/model/movement';
import { Subscription } from 'rxjs';
import { MovementsService } from '../movements/movements.service';
import { TimelineService } from './timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit, OnDestroy {
  
  loadedMovements: Movement[];
  listedmovements: Movement[];
  relevantMovements: Movement[];
  isLoading = false;
 private sub: Subscription;
  constructor(private movementsService: MovementsService,  private timelineService: TimelineService) {  }
  

  ngOnInit() {
    console.log('hello');
    this.sub = this.movementsService.movements.subscribe(movements => {
      this.loadedMovements= movements;
      this.relevantMovements = this.loadedMovements.filter(
        movement => movement.subscribed === true
      );
      this.listedmovements =this.relevantMovements;
    }
      );
    
    //this.movementsService.movements.subscribe(movements => {
      //this.movements = movements;
   //});
  }

  ionViewWillEnter() {
  
    this.isLoading = true;
    this.movementsService.fetchMovements().subscribe(() => {
      this.isLoading = false;
    });
  }

  DidIt(movementId: string){
    this.timelineService.DidIt(movementId);
  }

  

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
