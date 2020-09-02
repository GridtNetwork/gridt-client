import { of } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SettingsService } from '../../core/settings.service';
import { AuthService } from '../../core/auth.service';

import { ChangePasswordPage } from './change-password.page';
import { Settings } from '../../core/settings.model';

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class AuthServiceStub {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
}

describe('ChangePasswordPage', () => {
  let component: ChangePasswordPage;
  let fixture: ComponentFixture<ChangePasswordPage>;
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
      declarations: [ ChangePasswordPage ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
