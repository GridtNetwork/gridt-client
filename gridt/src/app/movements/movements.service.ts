
import { LoginService } from '../login/login.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { MovementModel } from './movement.model';
import { HttpClient } from '@angular/common/http';
import { TimelineService } from '../timeline/timeline.service';



   export interface Movement { 
    /**
     * Name of the movement
     */
    name: string;
    id: string;
    /**
     * True if the user is subscribed to this movement.
     */
    subscribed?: boolean;

    /**
     * A comprehensive description of the movement
     */
    shortDescription: string;
    /**
     * A much longer description that is used to 'sell' a movement to it's users.
     */
    description: string;

}
@Injectable({
    providedIn: 'root'
  })
  export class MovementsService {

   private _movements = new BehaviorSubject<Movement[]>([]);

  get movements() {
       return this._movements.asObservable();
    }

  constructor(private auth: LoginService,private http: HttpClient, private timeline: TimelineService) {}

  fetchMovements() {
    return this.auth.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: Movement }>(
          `https://gridt-85476.firebaseio.com/movements/.json?auth=${token}`
        );
      }),
      map(resData => {
          const movements = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              movements.push(
                new MovementModel(
                  key,
                  resData[key].name,
                  resData[key].description,
                  resData[key].shortDescription,
                )
              );
            }
          }
          return movements;
          // return [];
        }),
        tap(movements => {
          this._movements.next(movements);
        })
      );
  }


  getMovements(id: string) {

    return this.auth.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<Movement>(
          `https://gridt-85476.firebaseio.com/movements/${id}.json?auth=${token}`
        );
      }),
        map(movementData => {
          return new MovementModel(
            id,
            movementData.name,
            movementData.description,
            movementData.shortDescription
          );
        })
      );
      
  }

  addMovements(
    name: string,
    description: string,
    shortDescription: string
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newMovement: MovementModel;
     newMovement = new MovementModel(
      Math.random().toString(),
      name,
      description,
      shortDescription
    );
    return this.auth.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        console.log(fetchedUserId);
        return this.auth.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        newMovement = new MovementModel(
          Math.random().toString(),
          name,
          description,
          shortDescription
        );

    return this.http
      .post<{ name: string }>(
        `https://gridt-85476.firebaseio.com/movements.json?auth=${token}`,
        {
          ...newMovement,
          id: null,
          subscribed: true
        }
      );
    }),
        switchMap(resData => {
          generatedId = resData.name;
          return this.movements;
        }),
        take(1),
        tap(movements => {
          newMovement.id = generatedId;
          this._movements.next(movements.concat(newMovement));
        }));
  }

 /* Subscribe(movementId: string) {  
    let updated: MovementModel[];
    let fetchedToken: string;
    return this.auth.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.movements;
      }),
    take(1),
      switchMap(movements => {
        if (!movements || movements.length <= 0) {
          return this.fetchMovements();
        } else {
          return of(movements);
        }
      }),
      switchMap(movements => {
        const updatedMovementIndex = movements.findIndex(m => m.id === movementId);
        updated = [...movements];
        updated[updatedMovementIndex].subscribed = true;
        const oldSubscription = updated[updatedMovementIndex];
        updated[updatedMovementIndex] = new MovementModel(
          oldSubscription.id,
          oldSubscription.name,
          oldSubscription.subscribed,
          oldSubscription.description,
          oldSubscription.shortDescription
        );
        updated[updatedMovementIndex].subscribed = true;
        console.log(updated[updatedMovementIndex].subscribed);
        return this.http.put(
          `https://gridt-85476.firebaseio.com/movements/${movementId}.json?auth=${fetchedToken}`,
          { ...updated[updatedMovementIndex], id: null, subscribed: true }
        );
      }),
      tap(() => {
        this._movements.next(updated);
      })
    );
  }*/
}