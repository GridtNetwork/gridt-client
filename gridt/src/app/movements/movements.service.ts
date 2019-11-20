import { Movement } from '../../api/model/movement';
import { LoginService } from '../login/login.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { MovementModel } from './movement.model';
import { User, MovementInterval } from 'src/api';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })

  export class MovementsService {

   private _movements = new BehaviorSubject<Movement[]>([]);



  get movements() {
    
       return this._movements.asObservable();
    }
   

        
  constructor(private auth: LoginService,private http: HttpClient) {}


  fetchMovements() {
    return this.http
      .get<{ [key: string]: Movement }>(
        'https://gridt-f6485.firebaseio.com/movements.json'
      )
      .pipe(
        map(resData => {
          const movements = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              movements.push(
                new MovementModel(
                  key,
                  resData[key].name,
                  resData[key].subscribed,
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

    return this.http
      .get<Movement>(
        `https://gridt-f6485.firebaseio.com/movements/${id}.json`
      )
      .pipe(
        map(movementData => {
          return new MovementModel(
            id,
            movementData.name,
            movementData.subscribed,
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
    const newMovement = new MovementModel(
      Math.random().toString(),
      name,
      true,
      description,
      shortDescription
    );
    return this.http
      .post<{ name: string }>(
        'https://gridt-f6485.firebaseio.com/movements.json',
        {
          ...newMovement,
          id: null,
          subscribed: true
        }
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.movements;
        }),
        take(1),
        tap(movements => {
          newMovement.id = generatedId;
          this._movements.next(movements.concat(newMovement));
        })
      );
  }

  Subscribe(movementId: string) {
    
    let updated: MovementModel[];
    console.log('kkk');
    return this.movements.pipe(
      
      switchMap(movements => {
        console.log('kkk');
        if (!movements || movements.length <= 0) {
          return this.fetchMovements();
        } else {
          console.log('ddd');
          return of(movements);
        }
      }),
      switchMap(movements => {
        console.log('ddd');
        const updatedMovementIndex = movements.findIndex(m => m.id === movementId);
        updated = [...movements]; 
        updated[updatedMovementIndex].subscribed = true;
        console.log('kkk');
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
          `https://ionic-course-b67a0.firebaseio.com/offered-places/${movementId}.json`,
          { ...updated[updatedMovementIndex], id: null, subscribed: true }
        );
      }),
      tap(() => {
        this._movements.next(updated);
      })
    );
  }


}

   /* get movements() {
       return ;
    }
     
      getMovement(id: string, ) {
       
        return {
          ...this._movements.find(m =>  m.id === id)
        };
    }

    IsSubscribed( id: string){

       this._movements.filter(movement => {
         if(movement.id === id){
          movement.subscribed = true;
         }

      });


      
    }*/