import { of } from 'rxjs';
import { IonicModule, AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MovementsPage } from './movements.page';
import { MovementsFilterPipe } from './movement-filter.pipe';
import { AuthService } from '../../model/services/auth.service';
import { ApiService } from '../../model/services/api.service';
import { SettingsService } from 'src/app/model/services/settings.service';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('MovementsPage', () => {
  let component: MovementsPage;
  let fixture: ComponentFixture<MovementsPage>;
  let apiSpy: ApiService;
  let settingsSpy: SettingsService;
  let alertSpy: AlertController = jasmine.createSpyObj("alertSpy", ["create", "dismiss"]);

  beforeEach(waitForAsync(() => {
    apiSpy = jasmine.createSpyObj('ApiService', {
      getAllMovements: () => {}
    });
    settingsSpy = jasmine.createSpyObj('SettingsService', {
      updateIdentity: () => {}
    });

    TestBed.configureTestingModule({
      declarations: [ MovementsPage, MovementsFilterPipe ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]), 
        IonicModule, 
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ApiService, useValue: apiSpy },
        { provide: SettingsService, useValue: settingsSpy },
        { provide: AlertController, useValue: alertSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss the alert when leaving the page', () => {
    component.ngOnDestroy();
    expect(alertSpy.dismiss).toHaveBeenCalled();
  });
});
