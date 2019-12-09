import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform } from '@ionic/angular';

import { LoginService } from './login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Plugins, AppState, Capacitor } from '@capacitor/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy{
  private authSub: Subscription;
  private previousAuthState = false;
  public appPages = [
    {
      title: 'Movements',
      url: '/movements',
      icon: 'fitness'
    },
    {
      title: 'Profile',
      url: '/profile',
      icon: 'person'
    },
    {
      title: 'Timeline',
      url: '/timeline',
      icon: 'time'
    }
  ];

  constructor(
    private platform: Platform,
    private authService: LoginService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/login');
      }
      this.previousAuthState = isAuth;
    });
    Plugins.App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    //Plugins.App.removeListener('appStateChange', this.checkAuthOnResume);
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
