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

    let generatedId: string;
    let newOne: Timeline;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('No user id found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newOne = new Timeline(
          Math.random().toString(),
          false,
          movementId,
          movementName,
          
          fetchedUserId,
          
        );
        return this.http.post<{ name: string }>(
          `https://gridt-85476.firebaseio.com/timelines.json?auth=${token}`,
          { ...newOne, id: null }
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.timelines;
      }),
      take(1),
      tap(timelines => {
        newOne.id = generatedId;
        this._timeline.next(timelines.concat(newOne));
      })
    );
  }

  DidIt(timelineId: string, timeline:Timeline) {
    timeline.didIt=true;
    console.log(timeline);

    return this.authService.token.pipe(
      take(1),
      switchMap(token=> {
        console.log(timeline);

        return this.http.put(
          `https://gridt-85476.firebaseio.com/timelines/${timelineId}.json?auth=${token}`,
          { ...timeline }
        );
      })
    );
  }
/* DidIt(timelineId: string, timeline:Timeline) {
    
    let updated: Timeline[];
    console.log('aici');
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token=> {
        fetchedToken = token;
        console.log('aici');
        return this.timelines;
      }),
      switchMap(timelines => {
        const updatedTimelineIndex = timelines.findIndex(m => m.id === timelineId);
        updated = [...timelines];
        updated[updatedTimelineIndex].didIt = true;
        console.log(updated[updatedTimelineIndex].didIt);
        return this.http.put(
          `https://gridt-85476.firebaseio.com/timelines/${timelineId}.json?auth=${fetchedToken}`,
          { ...updated[updatedTimelineIndex] }
        );
      })
    );
  }*/
  cancelOne(timelineId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://gridt-85476.firebaseio.com/timelines/${timelineId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.timelines;
      }),
      take(1),
      tap(bookings => {
        this._timeline.next(bookings.filter(t => t.id !== timelineId));
      })
    );
  }

  fetchOne() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User not found!');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: TimelineData }>(
          `https://gridt-85476.firebaseio.com/timelines.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      map(timelineData => {
        const timelines = [];
        for (const key in timelineData) {
          if (timelineData.hasOwnProperty(key)) {
            timelines.push(
              new Timeline(
                key,
                timelineData[key].didIt,
                timelineData[key].movementId,
                timelineData[key].movementName,
                timelineData[key].userId
              )
            );
          }
        }
        return timelines;
      }),
      tap(timelines => {
        this._timeline.next(timelines);
      })
    );
  }
 
  
}