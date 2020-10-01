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

  public error_codes = {
    GETIDFAIL: "Could not GET identity",
    SETIDFAIL: "Could not SET identity",
    NOTLOGGEDIN: "Not logged in",
    SECSTOREUNAVAILABLE: "Secure storage not available.",
  }
  /**
   * Observable to obtain settings from secure storage
   * If secure storage is empty, this returns an unavailable error
   */
  public localIdentity$: Observable<Identity> = this.auth.readyAuthentication$.pipe(
    catchError( () => throwError(this.error_codes.GETIDFAIL + ": " + this.error_codes.NOTLOGGEDIN)),
    flatMap(() => this.secStore.get$("identity").pipe(
      catchError( () => throwError(this.error_codes.GETIDFAIL + ": " + this.error_codes.SECSTOREUNAVAILABLE))
    ))
  );

  /**
   * Store settings in the secure storage.
   * @param identity Settings to be stored.
   */
  public setLocalIdentity$(identity: Identity): Observable<boolean> {
    return this.auth.readyAuthentication$.pipe(
      catchError( () => throwError(this.error_codes.SETIDFAIL + ": " + this.error_codes.NOTLOGGEDIN)),
      take(1), // Makes sure the observable completes
      flatMap( () => this.secStore.set$("identity", identity).pipe(
          catchError(()=> throwError(this.error_codes.SETIDFAIL + ": " + this.error_codes.SECSTOREUNAVAILABLE))
      ))
    );
  }
}
