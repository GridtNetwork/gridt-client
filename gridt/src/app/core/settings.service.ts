import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, throwError, forkJoin } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, delay, catchError } from "rxjs/operators";
import { Identity } from './identity.model';
import { Settings } from './settings.model';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

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
    private secStore: SecureStorageService
  ) {}

  public error_codes = {}

  /**
   * Create ReplaySubject which yields the latest user settings.
   */
  private _user_settings$ = new ReplaySubject<Settings>(1);
  /*
   * The depth of the ReplaySubject is set to 1, which makes sure only the latest
   * available settings are retured to the user.
   */

  /**
   * Transforms the user settings Subject to an Observable
   */
  get the_user_settings$ (): Observable<Settings> {
    return this._user_settings$.asObservable();
  }

  /**
   * Observable to obtain settings from secure storage
   */
  private getLocalSettings = new Observable<Settings>( (observer) => {
    observer.next({username: "John1"});

    let set = this.setter.subscribe(set => {
      console.log(set.username);
      observer.next({username: set.username});
    });

    observer.complete();
  });

  private setter: Observable<Settings> = forkJoin({
    username: this.secStore.get$("username")
  })

  /**
   * Store settings in the secure storage.
   * @param settings Settings to be stored.
   */
  private storeLocalSettings(settings: Settings): void {
    this.secStore.set$("username", settings).subscribe();
  }

  /**
   * Update local storage whenever the settings change.
   */
  // _user_settings$.subscribe(
  //   (new_settings) => {
  //     this.storeLocalSettings(new_settings);
  //     console.log("New settings stored in secure local storage.")
  //   }
  // )

  public populateStorage(): void {
    console.log("Populating secure storage.")
    this.secStore.set$("username", "John2").subscribe();
  }

  /**
   * Observable to obtain settings from server
   */
  private getServerSettings = new Observable<Settings>( (observer) => {
    observer.next();
    observer.complete();
  })

  /**
   * Combine Local and server settings
   */
  public getUserSettings(): void {

    forkJoin({
      local: this.getLocalSettings,
      server: this.getServerSettings
    }).pipe(
      map( (settings) => {
        return {...settings.local, ...settings.server}
        // Server settings have priority over local settings
      })
    ).subscribe( (set) => this._user_settings$.next(set) );
  }
}
