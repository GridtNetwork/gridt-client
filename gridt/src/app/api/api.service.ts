import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, pluck, catchError } from 'rxjs/operators';

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

  public URL = 'http://api.gridt.org';

  constructor (private http: HttpClient) { }

  /*
   * Authenticate user on the server using provided credentials.
   */
  private authenticate(username: string, password:string) {
    this.http.post<AccessToken>(`${this.URL}/auth`, {username, password}).subscribe(
      carrier => this.token.next(carrier.access_token),
      error => {
        if (error.status == 400) this.token.next(null)
      }
    )
  }

  /*
   * Log the user in on the server, using provided credentials, or those sotred
   * in the application.
   */
  public login(username?: string, password?: string) {
    if (username && password) {
      this.username = username;
      this.password = password;
    }

    this.authenticate(this.username, this.password);
  }

  /*
   * Observe if the user is logged in.
   */
  public isLoggedIn$ = this.token.pipe( map(token => !!token) );

  /*
   * Register the user on the server.
   */
  public register(username: string, email: string, password: string): Observable<string> {
    return this.http.post<ServerMessage>(`${this.URL}/register`, {username, email, password}).pipe(
      pluck('message'),
      catchError( (error) => { return throwError(error.error.message) } )
    );
  }
}
