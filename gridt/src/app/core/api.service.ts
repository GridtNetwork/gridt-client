import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError, merge, partition } from "rxjs";
import { map, tap, pluck, catchError, flatMap, distinctUntilChanged, take } from "rxjs/operators";
import { Movement } from "./movement.model";
import { User } from './user.model';
import { AuthService } from './auth.service';

export interface ServerMessage {
  message: string;
}

@Injectable({
  providedIn: "root"
})
export class ApiService {
  public username: string;

  /*
   * Subscribe to this observable to ready the API.
   */
  public URL = "https://api.gridt.org";

  /**
   * Reuse a policy: Rll movements that have been previously obtained.
   */
  private _allMovements$ = new BehaviorSubject<Movement[]>([]);
  get allMovements$ (): Observable<Movement[]> {
    return this._allMovements$.asObservable(); 
  }

  /**
   * Reuse all subscriptions that have been previously obtained.
   */
  private _subscriptions$ = new BehaviorSubject<Movement[]>([]);
  get subscriptions$ (): Observable<Movement[]> {
    return this._subscriptions$.asObservable();
  }

  constructor (private http: HttpClient, private auth: AuthService) { }

  /*
   * Catch any error that is generated from the user not having a valid token.
   */
  private handleBadAuth () {
    // This function factory is necessary because the value in "this" gets
    // reset to a the "handleBadAuth" function instead of the service.
    return function (error) {
      // JWT Error
      if (error.status === 401) {
        return throwError(error.error.description);
      }
      
      // Server error
      if (error.error) {
        return throwError(error.error.message);
      }

      return throwError(error);
    };
  }

  /*
   * Request the server to create a new movement.
   */
  public createMovement$ (movement: Movement): Observable<string> {
    console.debug(`Creating movement "${movement.name}"`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.post<ServerMessage>(
        `${this.URL}/movements`, movement, options
      )),      
      catchError( this.handleBadAuth() ),
      pluck("message")
    );
  }

  /**
   * This simple helper functions grants the ability to update a movement in 
   * the behavior subject containing a list of all movements.
   * @param bsubject BehaviorSubject that you want to update.
   * @param movement The new version of the movement.
   */
  private replace_movement_in_bsubject(bsubject: BehaviorSubject<Movement[]>, movement: Movement) {
      let all_movements = bsubject.getValue();
      const index = all_movements.findIndex(m => m.name == movement.name);
      if (index != -1) {
        all_movements[index] = movement;
      } else {
        all_movements.push(movement);
      }

      bsubject.next(all_movements);
  }

  /*
   * Request single movement from server.
   */
  public getMovement$ (movement_id: number | string ): Observable<Movement> {
    console.debug(`Getting movement "${movement_id}" from server.`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.get<Movement>(
        `${this.URL}/movements/${movement_id}`,
        options
      ) as Observable<Movement>),
      catchError( this.handleBadAuth() ),
      tap( (movement) => {
        this.replace_movement_in_bsubject(this._subscriptions$, movement);
        this.replace_movement_in_bsubject(this._allMovements$, movement);
      })
    )
  }

  /**
   * Request all movements from the server.
   */
  public getAllMovements(): void {
    console.debug("Getting all movements from the server");

    this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.get<Movement[]>(
        `${this.URL}/movements`,
        options
      )),
      catchError( this.handleBadAuth() ),
      tap((movements) => this._allMovements$.next(movements)),
      map( () => true)
    ).subscribe();
  }

  /**
   * Request all movements that the user is subscribed to from the server.
   */
  public getSubscriptions(): void {
    console.debug("Getting all movements that the user is subscribed to.");

    this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.get<Movement[]>(
        `${this.URL}/movements/subscriptions`,
        options
      )),
      tap( (movements) => this._subscriptions$.next(movements)),
      catchError( this.handleBadAuth() )
    ).subscribe();
  }

  /**
   * Subscribe user to a movement.
   * @param movement_id The movement (id or string) that the user wants to subscribe to.
   */
  public subscribeToMovement$ (movement_id: number | string) {
    console.debug(`Subscribing to movement "${movement_id}".`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.put(
        `${this.URL}/movements/${movement_id}/subscriber`,
        {}, // This request does not require input, but the function needs a body.
        options
      )),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }

  /**
   * Unsubscribe user from a movement.
   * @param movement_id The movement (id or string) that the user wants to subscribe to.
   */
  public unsubscribeFromMovement$ (movement_id: number | string): Observable<string> {
    console.debug(`Unsubscribing from movement "${movement_id}".`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.delete<ServerMessage>(
        `${this.URL}/movements/${movement_id}/subscriber`,
        options
      )),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }

  /**
   * Swap one of the leaders identified with either username or user id in a
   * movement identified with a number or string.
   */
  public swapLeader$(movement: Movement, user: User): Observable<User> { 
    console.debug(`Swapping leader "@${user.username}#${user.id}" in movement "%${movement.name}#${movement.id}".`)

    return this.auth.readyAuthentication$.pipe(
      flatMap( options => this.http.post<User | ServerMessage>(
        `${this.URL}/movements/${movement.id}/leader/${user.id}`,
        {},
        options
      )),
      map( response => {
        if ("message" in response) {
          throw response.message;
        }
        
        return response as User;
      }),
      tap( new_user => {
        movement.leaders = movement.leaders.filter(u => u.username != user.username);
        movement.leaders.push(new_user);
        this.replace_movement_in_bsubject(this._allMovements$, movement);
        this.replace_movement_in_bsubject(this._subscriptions$, movement);
      }),
      catchError( this.handleBadAuth() )
    );
  }

  /*
   * Notify the server that the user has performed the movement related action.
   */
  public sendSignal$(movement: Movement, message: string): Observable<string> {
    console.debug(`Sending signal to movement "${movement.name}"`)

    const body = message ?  { message } : message;

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.post<ServerMessage>(
        `${this.URL}/movements/${movement.id}/signal`,
        body,
        options
      )),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }
}
