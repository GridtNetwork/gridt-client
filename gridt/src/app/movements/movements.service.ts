
import { LoginService } from '../login/login.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { take, map, tap, switchMap, mergeMap, catchError } from 'rxjs/operators';
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
    userList: Array<string>;

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
//Gets all the movements data
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
                  resData[key].userList
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

//Get's movement data
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
            movementData.shortDescription,
            movementData.userList
          );
        })
      );
      
  }
//Adds a new movement and stores it in the back-end

  addMovements(
    name: string,
    description: string,
    shortDescription: string
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newMovement: MovementModel;
    const userList=[];
     newMovement = new MovementModel(
      Math.random().toString(),
      name,
      description,
      shortDescription,
      userList
    );
    return this.auth.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.auth.token;
      }),
      take(1),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('No user found!');
        }
        userList.push(fetchedUserId);
        newMovement = new MovementModel(
          Math.random().toString(),
          name,
          description,
          shortDescription,
          userList
        );

    return this.http
      .post<{ name: string }>(
        `https://gridt-85476.firebaseio.com/movements.json?auth=${token}`,
        {
          ...newMovement,
          id: null,
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

  Join(movementId: string, movement:Movement, userId: string) {  

    let fetchedUserId: string;
    let userList=[];
    fetchedUserId= userId;
    userList = movement.userList;
    userList.push(fetchedUserId);
    movement.userList= userList;
    return this.auth.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.put(
          `https://gridt-85476.firebaseio.com/movements/${movementId}.json?auth=${token}`,
          { ...movement, userList, id: null }
        );
      })
    );
  }
}
