import { Injectable } from "@angular/core";
import { Observable, pipe, throwError, of } from "rxjs";
import { flatMap, tap, map, catchError, pluck } from "rxjs/operators";

import { Identity } from './models/identity.model';
import { AuthService } from './auth.service';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
  providedIn: "root"
})

export class SettingsService {

  constructor (
    private auth: AuthService,
    private secStore: SecureStorageService,
  ) {}

  /**
   * Observable to obtain settings from secure storage
   * If secure storage is empty, this returns an error
   */
  public localIdentity$: Observable<Identity> = this.auth.readyAuthentication$.pipe(
    flatMap(() => this.secStore.get$("identity"))
  );

  /**
   * Store settings in the secure storage.
   * @param identity Settings to be stored.
   */
  public setLocalIdentity(identity: Identity): Observable<boolean> {
    console.debug(`Storing identity: ${JSON.stringify(identity)} into the local storage.`);
    let loggedIn: boolean;
    this.auth.isLoggedIn$.subscribe( (val) => {loggedIn = val;});

    if (loggedIn) {
      this.secStore.set$("identity", identity).subscribe();
      return of(true);
    } else {
      return throwError("Not logged in");
    }
  }
}
