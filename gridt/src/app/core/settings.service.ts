import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, BehaviorSubject, throwError, forkJoin, of, pipe } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, flatMap, pluck, delay, catchError, skip, distinctUntilChanged, filter } from "rxjs/operators";
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
    // private api: ApiService
  ) {}

  /**
   * Create ReplaySubject which yields the latest user settings.
   */
  public _user_settings$ = new ReplaySubject<Settings>(1);
  /*
   * The depth of the ReplaySubject is set to 1, which makes sure only the
   * latest available settings are retured to the user.
   */

  public special_pipe$ = pipe(
    skip(1),                // Skip the local storage update
    distinctUntilChanged(), // Register the server response
    skip(1),                // Skip server response
    filter(val => !!val ),  // Skip no changes in the server setting
  );

  /**
   * Transforms the user settings Subject to an Observable
   */
  get the_user_settings$ (): Observable<Settings> {
    // If the user_settings change, make sure the new settings are stored
    // in the localstorage.
    this._user_settings$.pipe(
      // this.special_pipe$ // somehow this doesn't work
      skip(1),
      distinctUntilChanged(),
      skip(1),
    ).subscribe(
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
  public getSettingsFromServer(): void {
    console.log("Populating secure storage.");
    forkJoin({
      server: this.getServerIdentity
    }).pipe(
      tap( console.log ),
      map( (settings) => {
        console.log(`received server settings ${JSON.stringify(settings.server)}`);
        return {...settings.server}
        // Server settings have priority over local settings
      })
    ).subscribe( (set) => this.secStore.set$("settings", {set}).subscribe() );

    // let ID = {
    //   id: 1,
    //   username: "username",
    //   bio: "Bio",
    //   email: "email"};
    // this.secStore.set$("settings", {identity: ID}).subscribe();
  }

  /**
   * Update the _user_settings$ by combining Local and Server responses.
   */
  public getUserSettings(): void {
    console.log(`Getting user settings from local storage and server.`);
    forkJoin({
      local: this.getLocalSettings,
      server: this.getServerIdentity
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
   * This will be placed in API.service later on.
   */

  /**
   * Observable to obtain identity from server
   */
  public getServerIdentity = this.auth.readyAuthentication$.pipe(
   flatMap((options) => this.http.get<Identity>(
     `${this.URL}/identity`,
     options
   )),
   catchError( this.handleBadAuth(this.disabler$) ),
   map( id => {
     return {identity: id} // Return a <Settings> compatible object
   })
  )

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

  public postEmail$( password: string, new_email: string ) {
    console.debug(`Saving new email address ${new_email} to the server. (at leat it should now create a http.post)`);

    return this.auth.readyAuthentication$.pipe(
     flatMap((options) => this.http.post<ServerMessage>(
       `${this.URL}/change_email`, {password: password, new_email: new_email}, options
     )),
     catchError( this.handleBadAuth(this.disabler$) ),
     pluck("message")
    );
  }

  public postPassword$( old_password: string, new_password: string ) {
    console.debug(`Saving new password to the server. (at leat it should now create a http.post)`);

    return this.auth.readyAuthentication$.pipe(
     flatMap((options) => this.http.post<ServerMessage>(
       `${this.URL}/change_password`, {old_password: old_password, new_password: new_password}, options
     )),
     catchError( this.handleBadAuth(this.disabler$) ),
     pluck("message")
    );
  }

}
