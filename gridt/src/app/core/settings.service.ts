import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, BehaviorSubject, throwError, forkJoin, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, flatMap, pluck, delay, catchError } from "rxjs/operators";
import { Identity } from './identity.model';
import { Settings } from './settings.model';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

import { ApiService } from './api.service';

export interface ServerMessage {
  message: string;
}

@Injectable({
  providedIn: "root"
})
export class SettingsService {
  /*
   * Subscribe to this observable to ready the API.
   */
  public URL = "https://api.gridt.org";

  constructor (
    private http: HttpClient,
    private auth: AuthService,
    private secStore: SecureStorageService,
    private api: ApiService
  ) {}

  public error_codes = {}

  /**
   * Create ReplaySubject which yields the latest user settings.
   */
  public _user_settings$ = new ReplaySubject<Settings>(1);
  /*
   * The depth of the ReplaySubject is set to 1, which makes sure only the latest
   * available settings are retured to the user.
   */

  // private special_pipe = pipe(
  //   skip(1),                // Skip the local storage update
  //   distinctUntilChanged(), // Register the server response
  //   skip(1),                // Skip server response
  //   filter(val => !!val ),  // Skip no changes in the server setting
  // );

  /**
   * Transforms the user settings Subject to an Observable
   */
  get the_user_settings$ (): Observable<Settings> {
    // If the user_settings change, make sure they new settings are stored
    // in the localstorage.
    this._user_settings$.subscribe(
      // TODO add special pipe to prevent writing too many changes or failed server responses.
      new_settings => this.storeLocalSettings(new_settings)
    );
    return this._user_settings$.asObservable();
  }

  /**
   * Determines if settings are editable or not (depends on availability server)
   */
  private disabler$ = new BehaviorSubject<boolean>(false);

  get isDisabled$ (): Observable<boolean> {
    //debug
    return of(false)
    // return this.disabler$.asObservable();
  }

  /**
   * Observable to obtain settings from secure storage
   */
  private getLocalSettings = this.secStore.get$("settings") ;

  /**
   * Store settings in the secure storage.
   * @param settings Settings to be stored.
   */
  private storeLocalSettings(settings: Settings): void {
    console.log(`Storing ${JSON.stringify(settings)} into the local storage.`);
    this.secStore.set$("settings", settings).subscribe();
  }

  /**
   * Function to simulate some non-empty local storage, Only for testing purposes.
   */
  public populateStorage(): void {
    console.log("Populating secure storage.");
    let ID = {
      id: 1,
      username: "username",
      bio: "Bio",
      email: "email"};
    this.secStore.set$("settings", {identity: ID}).subscribe();
  }

  /**
   * Observable to obtain settings from server
   */
  private getServerSettings = this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.get<Identity>(
        `${this.URL}/identity`,
        options
      )),
      catchError( this.handleBadAuth(this.disabler$) ),
      map( id => {
        return {identity: id}
      })
    )

  /*
   * Catch any error that is generated from the user not having a valid token.
   */
  private handleBadAuth (disabler) {
    // This function factory is necessary because the value in "this" gets
    // reset to a the "handleBadAuth" function instead of the service.
    return function (error) {
      disabler.next(true)

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

  /**
   * Update the _user_settings$ by combining Local and Server responses.
   */
  public getUserSettings(): void {
    console.log(`Getting user settings from local storage and server.`);
    forkJoin({
      local: this.getLocalSettings,
      server: this.getServerSettings
    }).pipe(
      tap( console.log ),
      map( (settings) => {
        console.log(`received local settings ${JSON.stringify(settings.local)}`);
        console.log(`received server settings ${JSON.stringify(settings.server)}`);
        return {...settings.local, ...settings.server}
        // Server settings have priority over local settings
      })
    ).subscribe( (set) => this._user_settings$.next(set) );
  }

  /**
   * Save a specific settings
   */
  public saveUsername( username ): void {
    console.log(`Saving username ${username}`)
  }

  public saveEmail( email ): void {
    console.log(`Saving email ${email}`);
    this.putEmail( {email: email } );
    // If succesfull:
    //   this.getUserSettings()
    // else:
    //   Display error
  }

  /**
   * This will be placed in API.service later on.
   */

  public putBio$( bio: string ) {
    console.debug(`Saving new biography ${bio} to the server. (at leat it should now create a http.put)`);

    return this.auth.readyAuthentication$.pipe(
     flatMap((options) => this.http.put(
       `${this.URL}/bio`, {bio: bio}, options
     )),
     catchError( this.handleBadAuth(this.disabler$) ),
     pluck("message")
    );
  }

  public putUsername( username ): Observable<string> {
    console.debug(`Saving new username ${username} to the server. (at least it should now create a http.put)`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.put<ServerMessage>(
        `${this.URL}/username`, username, options
      )),
      catchError( this.handleBadAuth(this.disabler$) ),
      pluck("message")
    );
  }

  public putEmail( email ): Observable<string> {
    console.debug(`Saving new email ${email} to the server.`);

    return this.auth.readyAuthentication$.pipe(
      flatMap((options) => this.http.put(
        `${this.URL}/email`, {email}, options
      )),
      catchError( this.handleBadAuth(this.disabler$) ),
      pluck("message")
    );
  }


}
