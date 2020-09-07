import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, BehaviorSubject, throwError, forkJoin, of, pipe, UnaryFunction } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, flatMap, pluck, delay, catchError, skip, distinctUntilChanged, filter } from "rxjs/operators";

import { Identity } from './identity.model';
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

  private emptyIdentity: Identity = {
    id: 0,
    username: "",
    bio: "",
    avatar: "",
    email: ""
  }

  /**
   * Create ReplaySubject which yields the latest user settings.
   * The depth of the ReplaySubject is set to 1, which makes sure only the
   * latest available settings are retured to the user.
   */
  private _the_identity$ = new ReplaySubject<Identity>(1);

  public set_identity(identity): void {
    this._the_identity$.next(identity);
  };

  /**
   * Transforms the user settings Subject to an Observable
   */
  get identity$ (): Observable<Identity> {
    // If the user_settings change, make sure the new settings are stored
    // in the localstorage.
    let cachedValue: Identity;
    if (this.auth.isLoggedIn$.subscribe()) {
      this._the_identity$.pipe(
        distinctUntilChanged( (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        skip(1)
      ).subscribe(
        new_settings => this.storeLocalIdentity(new_settings)
      );
      return this._the_identity$.asObservable();
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
  private LocalIdentity$: Observable<Identity> = this.auth.readyAuthentication$.pipe(
   flatMap(() => this.secStore.get$("identity"))
 );

  /**
   * Store settings in the secure storage.
   * @param identity Settings to be stored.
   */
  private storeLocalIdentity(identity: Identity): void {
    console.log(`Storing ${JSON.stringify(identity)} into the local storage.`);
    this.secStore.set$("identity", identity).subscribe();
  }

  /**
   * Update the _user_settings$ by combining Local and Server responses.
   *
   * While a forkJoin may be usefull, it doesn't allow for simple error
   * catching, hence the two seperate subscriptions for local and server.
   */
  public updateIdentity(): void {
    console.log(`Getting user identity from local storage and server.`);
    this.LocalIdentity$.pipe(
      // Dissable input when error.
      // To make sure the page loads correctly we simply output an empty
      // Settings object upon error.
      catchError( ()=> {
        this.disabler$.next(true);
        return of(this.emptyIdentity)
      }),
      tap ( (set) => console.log(`received local settings ${JSON.stringify(set)}`) )
    ).subscribe( (set) => this._the_identity$.next(set) );

    this.api.Identity$.pipe(
      catchError( ()=> {
        this.disabler$.next(true);
        return of(this.emptyIdentity)
      }),
      filter( set => set != this.emptyIdentity), // Makes sure local gets priority
      tap( (set) => console.log(`received server settings ${JSON.stringify(set)}`) )
    ).subscribe( (set) => this._the_identity$.next(set) );
  }
}
