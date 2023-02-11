import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router, NavigationStart } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Capacitor } from '@capacitor/core';
import { App, AppState } from '@capacitor/app';
import { AuthService } from '../model/services/auth.service';
import { Observable } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: '../view/app.component.html'
})
export class AppComponent implements OnInit, OnDestroy{
  public isLoggedIn$: Observable<boolean>;

  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
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
  ];

  constructor(
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private zone: NgZone,
    private auth: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        this.splashScreen.hide();
      }
    });
  }

  ngOnInit() {
    // this.auth.isLoggedIn$ is a one-shot observable, which means that it is 
    // not updated when we navigate to another page. Therefore, we look at
    // navigation events to track the change of this.auth.isLoggedIn$.
    this.isLoggedIn$ = this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      mergeMap(() => this.auth.isLoggedIn$)
    );
    App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );
  }

  onLogout() {
  }

  ngOnDestroy() { }

  private checkAuthOnResume(state: AppState) {
    this.zone.run( () => {
      if (state.isActive) {
        this.auth.isLoggedIn$.subscribe(loggedIn => {
          if (!loggedIn) {
            console.log('On resuming the app found user is now logged out. Redirecting to /login');
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}
