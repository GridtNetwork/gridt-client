import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SettingsService } from '../core/settings.service';
import { AuthService } from '../core/auth.service';

import { SettingsPage } from './settings.page';
import { BehaviorSubject } from 'rxjs';

import { Settings } from '../core/settings.model';

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class AuthServiceStub {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
}

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let setSpy: SettingsService;

  let mock_movement: Settings = {
      identity: {
        id: 4,
        username: "Yo mamma",
        email: "yomamma@gridt.org",
        bio: "Don't make me mad",
        avatar: "abc"
        }
      }

  setSpy = jasmine.createSpyObj('SettingsService',
    {
      getSettingsFromServer: () => {},
      the_user_settings$: of(mock_movement),
      getUserSettings: () => {},
    }
  )

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
