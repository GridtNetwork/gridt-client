import { Observable, of, pipe, UnaryFunction, throwError, forkJoin } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';
import { flatMap, tap, catchError, map, mapTo, pluck } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Credentials } from '../interfaces/credentials.model';
import { ServerMessage, AccessToken } from '../interfaces/server-responses.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private secStore: SecureStorageService) {}

  public error_codes = {
    TOKENEXPIRED: "Token expired",
    TOKENUNAVAILABLE: 'Key "token" does not exist in the secure storage.',
    NOCREDENTIALS: "Can't authenticate: no credentials",
    INVALIDCREDENTIALS: "Authentication unsuccessful: invalid credentials"
  }

  /**
   * Check if the experiation date in the JWT token is expired.
   * @param token Token to be evaluated
   */
  private isTokenExpired(accessToken: AccessToken): boolean {
    const token = accessToken.access_token;
    const exp = JSON.parse(atob(token.split(".")[1]))["exp"];
    const expiration_date = new Date(exp * 1000);

    if (expiration_date < new Date()) {
      console.debug(`Token expired. Expiration date: ${expiration_date}`);
      return true;
    }

    return false;
  }

  /**
   * Pipe to handle authentication. Clears credentials when fails to authenticate.
   */
  private authenticate (): UnaryFunction<Observable<Credentials>, Observable<AccessToken>> {
    return pipe(
      tap(() => console.debug("Performing authentiation API call.")),
      flatMap(
        (credentials: Credentials) => {
          return this.http.post<AccessToken>(
          'https://api.gridt.org/auth', credentials // TODO: Get rid of hardcoded URL
          );
        }
      ),
      catchError( (error: HttpErrorResponse) => {
        // JWT error
        if (error.status == 401) {
          this.logout();
          return throwError(this.error_codes.INVALIDCREDENTIALS);
        }

        // Error in server response
        if (error.status) {
          return throwError(error.message);
        }

        // Error in previous steps
        return throwError(error);
      })
    )
  }

  /**
   * Observable to obtain credentials from the secure storage.
   */
  private getCredentials: Observable<Credentials> = forkJoin({
    username: this.secStore.get$("email"),
    password: this.secStore.get$("password")
  });

  /**
   * Pipe to make an AccessToken object into headers that can be used for API calls.
   */
  private prepareOptions: UnaryFunction<Observable<AccessToken>, Observable<{headers: HttpHeaders}>> = pipe(
    map(accesToken => ({
      headers: new HttpHeaders({
        Authorization: `JWT ${accesToken.access_token}`
      })
    })),
  );

  /**
   * Store credentials in the secure storage.
   * @param credentials Credentials to be stored.
   */
  private storeCredentials(credentials: Credentials): void {
    this.secStore.set$("email", credentials.username).subscribe();
    this.secStore.set$("password", credentials.password).subscribe();
  }

  /**
   * Store token in secure storage.
   * @param token Token to be stored
   */
  private storeToken(token: AccessToken) {
    this.secStore.set$("token", token.access_token).subscribe();
  }

  /**
   * One-shot observable to ready authentication for API calls.
   *
   * This observable follows the flow diagram in the documentation.
   */
  public readyAuthentication$: Observable<{headers: HttpHeaders}> = this.secStore.get$("token").pipe(
    map( (token_string: string) => ({ access_token: token_string }) ),
    flatMap(
      token => {
        if (this.isTokenExpired(token)) {
          return throwError(this.error_codes.TOKENEXPIRED);
        } else {
          return of(token);
        }
      }
    ),
    catchError( (error) => {
      if( error == this.error_codes.TOKENEXPIRED || error == this.error_codes.TOKENUNAVAILABLE ) {
        return this.getCredentials.pipe(
          catchError( () => throwError(this.error_codes.NOCREDENTIALS) ),
          this.authenticate(),
          // Bind neccessary to keep "this" pointing to service (instead of tap)
          tap( this.storeToken.bind(this) )
        );
      } else {
        return throwError(error);
      }
    }),
    this.prepareOptions
  );

  /**
   * Checks if a sucessful login has happened by searching for a token in
   * the secure storage.
   */
  public isLoggedIn$: Observable<boolean> = this.secStore.get$("token").pipe(
    map( () => true ),
    catchError( () => of(false))
  );

  /**
   * Log the user in on the server, obtaining a token.
   * @param email Email used for logging.
   * @param password Password for identification.
   * @returns Observable that will true if the login was succesful and be false if unsuccesful.
   */
  public login$(email: string, password: string): Observable<boolean> {
    const credentials: Credentials = {username: email, password};
    return of(credentials).pipe(
      tap( (c) => this.storeCredentials(c)),
      this.authenticate(),
      tap( this.storeToken.bind(this) ),
      mapTo(true),
      catchError( () => {
        this.secStore.clear$().subscribe();
        return of(false); // Not sure if this is better, or just leave the error.
      })
    );
  }

  /**
   * Register the user on the server.
   * @param username Username to identify user
   * @param email Email to reach user
   * @param password Password to identify user.
   */
  public register$(username: string, email: string, password: string): Observable<string> {
    console.debug(`Registering user ${username}.`);

    return this.http.post<ServerMessage>("https://api.gridt.org/register", {username, email, password}).pipe(
      pluck("message"),
      catchError( (error) => throwError(error.error.message) )
    );
  }

  /**
   * Clear all information stored in the secure storage concerning previous logins.
   */
  public logout(): void {
    this.secStore.clear$().subscribe();
  }
}
