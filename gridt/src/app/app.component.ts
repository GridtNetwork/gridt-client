import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Plugins, AppState, Capacitor } from '@capacitor/core';
import { ApiService } from './api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy{
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
    private api: ApiService
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
    Plugins.App.addListener(
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
        this.api.isLoggedIn$.subscribe(loggedIn => {
          if (!loggedIn) {
            console.log('On resuming the app found user is now logged out. Redirecting to /login');
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}
