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

  constructor (
    private http: HttpClient,
    private auth: AuthService,
    private secStore: SecureStorageService,
    private api: ApiService
  ) {}

  private emptySettings: Settings = {
    identity: {
      id: 0,
      username: "",
      bio: "",
      avatar: "",
      email: ""
    }
  }

  /**
   * Create ReplaySubject which yields the latest user settings.
   * The depth of the ReplaySubject is set to 1, which makes sure only the
   * latest available settings are retured to the user.
   */
  private _user_settings$ = new ReplaySubject<Settings>(1);

  public set_user_settings(settings): void {
    this._user_settings$.next(settings);
  };

  /**
   * Transforms the user settings Subject to an Observable
   */
  get the_user_settings$ (): Observable<Settings> {
    // If the user_settings change, make sure the new settings are stored
    // in the localstorage.
    let cachedValue: Settings;
    if (this.auth.isLoggedIn$.subscribe()) {
      this._user_settings$.pipe(
        distinctUntilChanged( (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        skip(1)
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
   * If secure storage is empty, return empty settings object
   */
  private getLocalSettings$: Observable<Settings> = this.auth.readyAuthentication$.pipe(
   flatMap(() => this.secStore.get$("settings"))
 );

  /**
   * Store settings in the secure storage.
   * @param settings Settings to be stored.
   */
  private storeLocalSettings(settings: Settings): void {
    console.log(`Storing ${JSON.stringify(settings)} into the local storage.`);
    this.secStore.set$("settings", settings).subscribe();
  }

  /**
   * Update the _user_settings$ by combining Local and Server responses.
   *
   * While a forkJoin may be usefull, it doesn't allow for simple error
   * catching, hence the two seperate subscriptions for local and server.
   */
  public updateUserSettings(): void {
    console.log(`Getting user settings from local storage and server.`);
    this.getLocalSettings$.pipe(
      // Dissable input when error.
      // To make sure the page loads correctly we simply output an empty
      // Settings object upon error.
      catchError( ()=> {
        this.disabler$.next(true);
        return of(this.emptySettings)
      }),
      tap ( (set) => console.log(`received local settings ${JSON.stringify(set)}`) )
    ).subscribe( (set) => this._user_settings$.next(set) );

    this.api.getServerIdentity$.pipe(
      catchError( ()=> {
        this.disabler$.next(true);
        return of(this.emptySettings)
      }),
      filter( set => set != this.emptySettings), // Makes sure local gets priority
      tap( (set) => console.log(`received server settings ${JSON.stringify(set)}`) )
    ).subscribe( (set) => this._user_settings$.next(set) );
  }
}
