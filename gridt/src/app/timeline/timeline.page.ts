import { Timeline } from './timeline.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { MovementsService, Movement } from '../movements/movements.service';
import { TimelineService } from './timeline.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit, OnDestroy {
  
  loadedMovements: Timeline[];
  isLoading = false;
 private sub: Subscription;
  constructor(private movementsService: MovementsService,  private timelineService: TimelineService) {  }
  

  ngOnInit() {
    this.sub = this.timelineService.timelines.subscribe(timeline => {
      this.loadedMovements= timeline;
    });
  }

  ionViewWillEnter() {
  
    this.isLoading = true;
    this.timelineService.fetchOne().subscribe(() => {
      this.isLoading = false;
    });
  }

  DidIt(timeline: Timeline, timelineId: string){
    this.timelineService.DidIt(timelineId, timeline);
  }

  

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
