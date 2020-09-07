import { of } from 'rxjs';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SettingsService } from '../../core/settings.service';
import { AuthService } from '../../core/auth.service';
import { Identity } from '../../core/models/identity.model';

import { ChangeBioPage } from './change-bio.page';

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class AuthServiceStub {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
}

describe('ChangeBioPage', () => {
  let component: ChangeBioPage;
  let fixture: ComponentFixture<ChangeBioPage>;

  let setSpy: SettingsService;

  let mock_identity: Identity = {
    id: 4,
    username: "Yo mamma",
    email: "yomamma@gridt.org",
    bio: "Don't make me mad",
    avatar: "abc"
  }

  setSpy = jasmine.createSpyObj('SettingsService',
    {
      getSettingsFromServer: () => {},
      the_user_settings$: of(mock_identity),
      getUserSettings: () => {},
    }
  )

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeBioPage ],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeBioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
