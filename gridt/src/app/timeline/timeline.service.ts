import { LoginService } from './../login/login.service';
import { Timeline } from './timeline.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';



interface TimelineData{
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
    movementId: string,
  ) {
    let generatedId: string;
    const newInfo = new Timeline(
      movementId,
      this.authService.userId,
      false
    );
    console.log('bbbb');
    return this.http
      .post<{ name: string }>(
        'https://gridt-f6485.firebaseio.com/timeline.json',
        { ...newInfo, id: null }
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.timelines;
        }),
        take(1),
        tap(timeline => {
          
          this._timeline.next(timeline.concat(newInfo));
        })
      );
  }

 
  
}