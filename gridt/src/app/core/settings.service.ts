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
    return this.auth.readyAuthentication$.pipe(
      catchError( () => throwError("Could not set identity: not logged in")),
      take(1), // Makes sure the observable completes
      flatMap( () => this.secStore.set$("identity", identity).pipe(
          catchError(()=> throwError("Could not set identity: secure storage not available."))
        )
      )
    )
  }
}
