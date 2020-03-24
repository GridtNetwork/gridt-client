import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';


@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanLoad {
  constructor(private api: ApiService, private router: Router) {}
//Doesn't let you in the app unless authentificated
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    return this.api.isLoggedIn$.pipe(
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          console.error(`User ${this.api.username ? this.api.username + ' ' : ''}is not logged in. Guarding page and returning to /login.`);
          this.router.navigateByUrl('/login');
        } else {
          console.debug('Passed the guard');
        }
      })
    );
  }
}
