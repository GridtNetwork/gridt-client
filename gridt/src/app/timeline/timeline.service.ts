import { LoginService } from './../login/login.service';
import { Timeline } from './timeline.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';



interface TimelineData{
    movementName: string;
    movementId: string;
    userId: string;
    didIt: boolean;

}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private _timeline = new BehaviorSubject<Timeline[]>([]);

  get timelines() {
    return this._timeline.asObservable();
  }

  constructor(private authService: LoginService, private http: HttpClient) {}

  addOne(
    movementId: string, movementName: string
  ) {

    const newInfo = new Timeline(
      movementName,
      movementId,
      'abc',
      false
    );
    console.log(newInfo);
    return this.http
      .post(
        'https://gridt-f6485.firebaseio.com/timelines.json',
        { ...newInfo}
      );
  }

  DidIt(movementId: string) {
    console.log('aici');
    let updated: Timeline[];
    return this.timelines.pipe(
      take(1),
      switchMap(timelines => {
        const updatedTimelineIndex = timelines.findIndex(m => m.movementId === movementId);
        updated = [...timelines]; 
        updated[updatedTimelineIndex].didIt = true;
        console.log(updated[updatedTimelineIndex].didIt);
        return this.http.put(
          `https://gridt-f6485.firebaseio.com/timelines/${movementId}.json`,
          { ...updated[updatedTimelineIndex] }
        );
      })
    );
  }

 
  
}