import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, throwError } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap, catchError, flatMap } from "rxjs/operators";
import { Identity } from './identity.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: "root"
})
export class SettingsService {
  /*
   * Subscribe to this observable to ready the API.
   */
  public URL = "https://api.gridt.org";

   constructor (private http: HttpClient, private auth: AuthService) {}


   public _id$ = new BehaviorSubject<Identity>({id: 0, username: "John Doe", bio: "a very short bio", email: "john_doe@gridt.org", gravatar: "https://www.gravatar.com/avatar/e950226ca4490c8fa967f9c282fb51f2"});
   get theID$ (): Observable<Identity> {
     return this._id$.asObservable();
   }

   private handleBadAuth () {
     // This function factory is necessary because the value in "this" gets
     // reset to a the "handleBadAuth" function instead of the service.
     return function (error) {
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

   private replace_id_in_bsubject(bsubject: BehaviorSubject<Identity>, identity: Identity) {
     let this_identity = bsubject.getValue();
     this_identity = identity;

     bsubject.next(this_identity);
   }

   /**
    * Obtain full identity of the user from server
    */
   public getSettings(): void {
     console.debug("Getting identity from the server");

     this.auth.readyAuthentication$.pipe(
       flatMap((options) => this.http.get<Identity>(
         `${this.URL}/identity`,
         options
       ) as Observable<Identity>),
       catchError (this.handleBadAuth() ),
       tap( (identity) => this.replace_id_in_bsubject(this._id$, identity)),
       map( () => true)
     ).subscribe();
   }


}
