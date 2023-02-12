import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { AuthService } from '../model/services/auth.service';
import { SelectMultipleControlValueAccessor } from '@angular/forms';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('AppComponent', () => {
  let splashScreenSpy, platformReadySpy, platformSpy, fixture, app, appElement;

  beforeEach(waitForAsync(() => {
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    platformReadySpy = Promise.resolve(1);
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: AuthService, useClass: AuthServiceStub }
      ],
      imports: [ RouterTestingModule.withRoutes([]), HttpClientModule ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    appElement = fixture.debugElement.nativeElement;
  }));

  it('should create the app', async () => {
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    expect(platformSpy.ready).toHaveBeenCalled();
  });
  
  it('should have menu labels', async () => {
    // Note: first is necessary for calling ngOnInit which sets isLoggedIn$
    await fixture.detectChanges();
    app.isLoggedIn$ = of(true);
    await fixture.detectChanges();
    const menuItems = appElement.querySelectorAll('ion-label');
    expect(menuItems.length).toEqual(4);
  });
  
  it('should have urls', async () => {
    // Note: first is necessary for calling ngOnInit which sets isLoggedIn$
    await fixture.detectChanges();
    app.isLoggedIn$ = of(true);
    await fixture.detectChanges();
    const menuItems = appElement.querySelectorAll('ion-item');
    expect(menuItems.length).toEqual(4);
  });
});
