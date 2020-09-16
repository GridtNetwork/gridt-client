import { Injectable } from "@angular/core";
import { Observable, pipe, throwError, of, iif } from "rxjs";
import { flatMap, tap, map, catchError, pluck, mergeMap, take } from "rxjs/operators";

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
  public setLocalIdentity$(identity: Identity): Observable<boolean> {
    return this.auth.isLoggedIn$.pipe(
      take(1),
      tap( (val) => {
        if (val === true) {
          console.debug(`Storing identity: ${JSON.stringify(identity)} into the local storage.`);
          this.secStore.set$("identity", identity).subscribe();
        }
      }),
      mergeMap( val => iif( () => val === true, of(true), throwError("Not logged in: can't store identity in local storage.")))
    )
  }
}
