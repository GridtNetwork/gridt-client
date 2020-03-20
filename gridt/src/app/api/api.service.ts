import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, merge, partition } from 'rxjs';
import { map, tap, pluck, skip, last, catchError, flatMap } from 'rxjs/operators';
import { Movement } from './movement.model';

interface AccessToken {
  access_token: string;
}

interface ServerMessage {
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private token = new BehaviorSubject<string>(null);
  private username: string;
  private password: string;

  /*
   * Subscribe to this observable to ready the API.
   */
  private ApiReady: Observable<boolean>;

  public URL = 'http://api.gridt.org';

  /*
   * Observe if the user is logged in. The logic here is that if the user was
   * able to obtain a token in the past, that he will be able to do it now as
   * well.
   */
  public isLoggedIn$ = this.token.pipe(
    map(token => !!token) // TODO: Use distinct until changed
  );

  constructor (private http: HttpClient) {
    /*
     * Determine, using the expiration date on the token, if the API is ready to
     * be called.
     */
    const ApiIsReady: Observable<boolean> = this.token.pipe(
      map(token => {
        if (!token) {
          return false;
        }

        const exp = JSON.parse(atob(this.token.getValue().split('.')[1]))['exp'];
        const expiration_date = new Date(exp);

        if (expiration_date < new Date()) {
          return false
        }
        return true;
      })
    );

    const [ready, notReady] = partition(ApiIsReady, val => val);

    notReady.pipe(tap(_ => console.debug('API not ready'))).subscribe();
    ready.pipe(tap(_ => console.debug('API ready'))).subscribe();

    this.ApiReady = merge(ready, notReady.pipe(
      flatMap(_ => this.authenticate()),
      map(_ => true) // If authenticate does not error, we are logged in.
    ));
  }

  /*
   * Authenticate user on the server using provided credentials or those
   * already stored.
   */
  private authenticate(username?: string, password?:string): Observable<string> {
    console.debug('Authenticating');

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
      pluck('access_token'),
      tap( (new_token) => {
        this.token.next(new_token);
      }),
      catchError( (error:any) => {
        if (error.status == 400 || error.status == 401) {
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
  public login(username: string, password: string): Observable<boolean> {
    return this.authenticate(username, password).pipe(
      map( token => !!token ),
      tap( val => console.debug(val ?  "Sucessfully logged in." : "Login failed.") )
    );
  }

  /*
   * Register the user on the server.
   */
  public register(username: string, email: string, password: string): Observable<string> {
    console.debug('Registering.');

    return this.http.post<ServerMessage>(`${this.URL}/register`, {username, email, password}).pipe(
      pluck('message'),
      catchError( (error) => { return throwError(error.error.message) } )
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
    // This function factory is necessary because the value in 'this' gets
    // reset to a the 'handleBadAuth' function, instead of the service, which
    // is however necessary to be able to generate a new token if necessary.
    const service = this;

    return function (error) {
      if (error.status == 401) {
        service.token.next(null);
        return throwError(error.error.description);
      }

      return throwError(error.error.message);
    }
  }

  /*
   * Request the server to create a new movement.
   */
  public createMovement (movement: Movement): Observable<string> {
    console.debug('Creating movement');

    const request: Observable<string> = this.http.post<ServerMessage>(
      `${this.URL}/movements`, movement, this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() ),
      pluck('message')
    );

    return this.ApiReady.pipe(
      flatMap(_ => request)
    );
  }

  /*
   * Request all movements from the server.
   */
  public getAllMovements (): Observable<Movement[]> {
    const request = this.http.get<Movement[]>(
      `${this.URL}/movements`,
      this.getOptions()
    ).pipe(
      catchError( this.handleBadAuth() )
    );

    return this.ApiReady.pipe(
      flatMap(_ => request)
    );
  }
}
