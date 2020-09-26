import { Injectable } from "@angular/core";
import { Observable, pipe, throwError, of, iif, forkJoin, ReplaySubject } from "rxjs";
import { flatMap, tap, catchError, take } from "rxjs/operators";

import { Identity } from './models/identity.model';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { SecureStorageService } from './secure-storage.service';

@Injectable({
  providedIn: "root"
})

export class SettingsService {

  constructor (
    private auth: AuthService,
    private api: ApiService,
    private secStore: SecureStorageService,
  ) {}

  public error_codes = {
    GETIDFAIL: "Could not GET identity",
    SETIDFAIL: "Could not SET identity",
    NOTLOGGEDIN: "Not logged in",
    SECSTOREUNAVAILABLE: "Secure storage not available.",
  }

  public empty_identity: Identity = {
    id: null,
    username: "",
    bio: "",
    email: "",
    avatar: ""
  }

  /**
  * Emits the last known identity
  */
  private _user_identity$ = new ReplaySubject<Identity>(1);

  /**
  * This Observable can be used in applications to display the latest known
  * identity of the user.
  */
  public userIdentity$: Observable<Identity> = this._user_identity$.asObservable();

  /**
  * This function updates the user identity.
  * - When the server ID is different from the ID stored locally the local ID
  *   is overwritten with the server ID. Then emit local ID.
  * - If both the server and local identity agree, emit local ID.
  * - If the server is unavailable, emit local ID.
  * - If both server and local identity are unavailable, emit empty ID.
  *
  * - Makes sure all errors are caught such that this function always gives an
  *   output.
  */
  private mapErrorToEmptyID = pipe(
    catchError( err => of<Identity>(this.empty_identity)),
    flatMap( (id) => of(<Identity>(id)))
  );

  private mapErrorToFalse = pipe(
    catchError( err => {console.warn(err); return of<boolean>(false);})
  );

  public updateIdentity(): void {
    // Combine server and local id. Catch errors to make sure pipe runs.
    forkJoin({
      server: this.api.userIdentity$.pipe( this.mapErrorToEmptyID ),
      local: this.localIdentity$.pipe( this.mapErrorToEmptyID )
    }).pipe(
      // Update local id when server id is different.
      tap( (ids) => console.log(`recieved server id = ${JSON.stringify(ids.server)} \n received local id = ${JSON.stringify(ids.local)}`)),
      tap( (ids) => console.log(`logic result is = ${JSON.stringify(ids.server)==JSON.stringify(ids.local)}`)),
      flatMap( (ids) => iif(
        () => (JSON.stringify(ids.server)==JSON.stringify(ids.local)),// && JSON.stringify(ids.server) != this.empty_identity), // && ids[0].id == ids[1].id
        of(true),
        this.setLocalIdentity$(ids.server)
      )),
      // Make sure any errors arising from setting local identity are
      // transformed into a warning and continue.
      this.mapErrorToFalse,
      // Emit local identity
      flatMap( () => this.localIdentity$ ),
      // If local identity unvailable emit empty ID.
      this.mapErrorToEmptyID,
      // make sure subscription completes and gives only one update.
      take(1)
    ).subscribe( (id) => {console.log(`emitted id = ${id}`); this._user_identity$.next(id)});
  };

  /**
   * Observable to obtain identity from secure storage
   * If secure storage is empty, this returns an unavailable error
   */
  public localIdentity$: Observable<Identity> = this.auth.readyAuthentication$.pipe(
    catchError( () => throwError(this.error_codes.GETIDFAIL + ": " + this.error_codes.NOTLOGGEDIN)),
    flatMap(() => this.secStore.get$("identity").pipe(
      catchError( () => throwError(this.error_codes.GETIDFAIL + ": " + this.error_codes.SECSTOREUNAVAILABLE))
    )),
    flatMap( (id) => of<Identity>(id))
  );

  /**
   * Store identity in the secure storage.
   * @param identity Identity to be stored.
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
