import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError, merge, partition } from "rxjs";
import { map, take, tap, pluck, catchError, flatMap, distinctUntilChanged } from "rxjs/operators";
import { Movement } from "./movement.model";

export interface AccessToken {
  access_token: string;
}

interface ServerMessage {
  message: string;
}

@Injectable({
  providedIn: "root"
})
export class ApiService {
  private token = new BehaviorSubject<string>(null);
  public username: string;
  private password: string;

  /*
   * Subscribe to this observable to ready the API.
   */
  public isApiReady$: Observable<boolean>;
  public URL = "http://api.gridt.org";

  /**
   * Reuse all movements that have been previously obtained.
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

  /*
   * Observe if the user is logged in. The logic here is that if the user was
   * able to obtain a token in the past, that he will be able to do it now as
   * well.
   */
  public isLoggedIn$ = this.token.pipe(
    map(token => !!token),
    distinctUntilChanged()
  );

  constructor (private http: HttpClient) {
    /*
     * Determine, using the expiration date on the token, if the API is ready to
     * be called.
     */
    const [ready, notReady] = partition(this.token, token => {
      if (!token) {
        console.debug("No token available.");
        return false;
      }

      const exp = JSON.parse(atob(this.token.getValue().split(".")[1]))["exp"];
      const expiration_date = new Date(exp * 1000);

      if (expiration_date < new Date()) {
        console.debug(`Token expired. Expiration date: ${expiration_date}`);
        return false;
      }

      return true;
    });

    notReady.pipe(tap(_ => console.debug("API not ready"))).subscribe();
    ready.pipe(tap(_ => console.debug("API ready"))).subscribe();

    this.isApiReady$ = merge(
      ready.pipe(map(_ => true)), // If the token is valid we are ready.
      notReady.pipe(
        flatMap(_ => this.authenticate$()),
        map(_ => true) // If authenticate does not error, we are ready.
      )
    );
  }

  /*
   * Authenticate user on the server using provided credentials or those
   * already stored.
   */
  private authenticate$(username?: string, password?: string): Observable<string> {
    console.debug("Authenticating");

    // Store password
    if ( username && password ) {
      this.username = username;
      this.password = password;
    }

    if ( !this.username  || !this.password) {
      return new Observable( (observer) => {
        observer.error("Not logged in yet.");
      });
    }

    return this.http.post<AccessToken>(
      `${this.URL}/auth`,
      {
        username: this.username,
        password: this.password
      }
    ).pipe(
      pluck("access_token"),
      tap( (new_token) => {
        this.token.next(new_token);
      }),
      catchError( (error: any) => {
        if (error.status === 400 || error.status === 401) {
          this.token.next(null);
        }
        return throwError("Could not login");
      }),
    );
  }

  /*
   * Log the user in on the server, using provided credentials.
   * Return an observable with boolean success.
   *
   * Currently this is a simple shell around authenticate.
   */
  public login$(username: string, password: string): Observable<boolean> {
    return this.authenticate$(username, password).pipe(
      map( token => !!token ),
      tap( val => console.debug(val ?  "Sucessfully logged in." : "Login failed.") )
    );
  }

  /*
   * Register the user on the server.
   */
  public register$(username: string, email: string, password: string): Observable<string> {
    console.debug(`Registering user ${username}.`);

    return this.http.post<ServerMessage>(`${this.URL}/register`, {username, email, password}).pipe(
      pluck("message"),
      catchError( (error) =>  throwError(error.error.message) )
    );
  }

  /*
   * Generate the headers neccessary to make a sucessful request to the server.
   */
  private getOptions () {
    return {
      headers: new HttpHeaders({
        Authorization: `JWT ${this.token.getValue()}`
      })
    };
  }

  /*
   * Catch any error that is generated from the user not having a valid token.
   */
  private handleBadAuth () {
    // This function factory is necessary because the value in "this" gets
    // reset to a the "handleBadAuth" function, instead of the service, which
    // is however necessary to be able to generate a new token if necessary.
    const service = this;

    return function (error) {
      if (error.status === 401) {
        service.token.next(null);
        return throwError(error.error.description);
      }

      return throwError(error.error.message);
    };
  }

  /*
   * Request the server to create a new movement.
   */
  public createMovement$ (movement: Movement): Observable<string> {
    console.debug(`Creating movement "${movement.name}"`);

    const request: Observable<string> = this.http.post<ServerMessage>(
      `${this.URL}/movements`, movement, this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() ),
      pluck("message")
    );

    return this.isApiReady$.pipe(
      flatMap(_ => request)
    );
  }

  /*
   * Request single movement from server.
   */
  public getMovement$ (movement_id: number | string ): Observable<Movement> {
    console.debug(`Getting movement ${movement_id} from server.`);

    const request = this.http.get<Movement>(
      `${this.URL}/movements/${movement_id}`,
      this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() )
    );

    return this.isApiReady$.pipe(
      flatMap(() => request)
    )
  }

  /*
   * Request all movements from the server.
   */
  public getAllMovements(): void {
    console.debug("Getting all movements from the server");

    const request = this.http.get<Movement[]>(
      `${this.URL}/movements`,
      this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() )
    );

    this.isApiReady$.pipe(
      flatMap(() => request),
      tap((movements) => this._allMovements$.next(movements)),
      map( () => true)
    ).subscribe();
  }

  /*
   * Request all movements that the user is subscribed to from the server.
   */
  public getSubscriptions(): void {
    console.debug("Getting all movements that the user is subscribed to.");

    const request = this.http.get<Movement[]>(
      `${this.URL}/movements/subscriptions`,
      this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() )
    );

    this.isApiReady$.pipe(
      flatMap(() => request),
      tap( (movements) => this._subscriptions$.next(movements)),
    ).subscribe();
  }

  /*
   * Subscribe user to a movement.
   */
  public subscribeToMovement$ (movement_id: number | string) {
    const request = this.http.put(
      `${this.URL}/movements/${movement_id}/subscriber`,
      {}, // This request does not require input, but the function needs a body.
      this.getOptions()
    );

    return this.isApiReady$.pipe(
      flatMap(() => request),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }

  /*
   * Unsubscribe user from a movement.
   */
  public unsubscribeFromMovement$ (movement_id: number | string): Observable<string> {
    const request = this.http.delete<ServerMessage>(
      `${this.URL}/movements/${movement_id}/subscriber`,
      this.getOptions()
    );

    return this.isApiReady$.pipe(
      flatMap(() => request),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }

  /**
   * Swap one of the leaders identified with either username or user id in a
   * movement identified with a number or string.
   */
  public swapLeader$(movement_id: number | string, user_id: number | string): Observable<string> { 
    const request = this.http.post<ServerMessage>(
      `${this.URL}/movements/${movement_id}/leader/${user_id}`,
      {},
      this.getOptions()
    )

    return this.isApiReady$.pipe(
      flatMap(() => request),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }

  /*
   * Notify the server that the user has performed the movement related action.
   */
  public sendUpdate$(movement_id: number | string): Observable<string> {
    const request = this.http.post<ServerMessage>(
      `${this.URL}/movements/${movement_id}/update`,
      {},
      this.getOptions()
    )

    return this.isApiReady$.pipe(
      flatMap(() => request),
      pluck("message"),
      catchError( this.handleBadAuth() )
    );
  }
}
