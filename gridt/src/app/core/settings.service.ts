import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, BehaviorSubject, throwError, forkJoin, of, pipe, UnaryFunction } from "rxjs";
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
    private api: ApiService
  ) {}

  /**
   * Create ReplaySubject which yields the latest user settings.
   */
  public _user_settings$ = new ReplaySubject<Settings>(1);
  // The depth of the ReplaySubject is set to 1, which makes sure only the
  // latest available settings are retured to the user.

  /**
   * Create a pip which skips the trivial updates of _user_settings$
   */
  public special_pipe$: UnaryFunction<Observable<Settings>, Observable<Settings>> =
    pipe(
      skip(1),                // Skip default
      distinctUntilChanged(), // Register the server response
      // filter(val => !!val ),  // Skip no changes in the server setting
    );

  /**
   * Transforms the user settings Subject to an Observable
   */
  get the_user_settings$ (): Observable<Settings> {
    // If the user_settings change, make sure the new settings are stored
    // in the localstorage.
    if (this.auth.isLoggedIn$.subscribe()) {
      this._user_settings$.pipe(
        this.special_pipe$
      ).subscribe(
        new_settings => this.storeLocalSettings(new_settings)
      );
      return this._user_settings$.asObservable();
    }
  }

  /**
   * Determines if settings are editable or not (depends on availability server)
   */
  private disabler$ = new BehaviorSubject<boolean>(false);

  get isDisabled$ (): Observable<boolean> {
    return this.disabler$.asObservable();
  }

  private Dissable(disabler) {
    return function(error) {
      disabler.next(true)
      return throwError(error);
    };
  }

  /**
   * Observable to obtain settings from secure storage
   */
  private getLocalSettings$ = this.auth.readyAuthentication$.pipe(
   flatMap(() => this.secStore.get$("settings")),
   catchError( this.Dissable(this.disabler$) )
 );

  /**
   * Store settings in the secure storage.
   * @param settings Settings to be stored.
   */
  private storeLocalSettings(settings: Settings): void {
    console.log(`Storing ${JSON.stringify(settings)} into the local storage.`);
    this.secStore.set$("settings", settings);
  }

  /**
   * Function to process server response
   */
  public getSettingsFromServer(): void {
    console.log("Populating secure storage.");
    forkJoin({
      server: this.api.getServerIdentity$
    }).pipe(
      catchError( this.Dissable(this.disabler$) ),
      tap( console.log ),
      map( (settings) => {
        console.log(`received server settings ${JSON.stringify(settings.server)}`);
        return {...settings.server}
        // Server settings have priority over local settings
      })
    ).subscribe( (set) => this.secStore.set$("settings", {set}).subscribe() );
  }

  /**
   * Update the _user_settings$ by combining Local and Server responses.
   */
  public getUserSettings(): void {
    console.log(`Getting user settings from local storage and server.`);
    forkJoin({
      local: this.getLocalSettings$,
      server: this.api.getServerIdentity$
    }).pipe(
      catchError( this.Dissable(this.disabler$) ),
      tap( console.log ),
      map( (settings) => {
        console.log(`received local settings ${JSON.stringify(settings.local)}`);
        console.log(`received server settings ${JSON.stringify(settings.server)}`);
        return {...settings.local, ...settings.server}
        // Server settings have priority over local settings
      })
    ).subscribe( (set) => this._user_settings$.next(set) );
  }


}
