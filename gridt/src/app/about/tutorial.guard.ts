import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialGuard implements CanActivate {
  constructor(private storage: Storage, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      const isComplete = this.storage.get('tutorialComplete')

      if (!isComplete) {
        this.router.navigateByUrl('/about');
        console.log("Introducing the app");
      }
      
      return isComplete;
  }
  
}
