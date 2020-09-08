import { of } from 'rxjs';
import { IonicModule, AlertController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MovementsPage } from './movements.page';
import { MovementsFilterPipe } from './movement-filter.pipe';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('MovementsPage', () => {
  let component: MovementsPage;
  let fixture: ComponentFixture<MovementsPage>;
  let apiSpy: ApiService;
  let alertSpy: AlertController = jasmine.createSpyObj("alertSpy", ["create", "dismiss"]);

  beforeEach(async(() => {
    apiSpy = jasmine.createSpyObj('ApiService', {
      getAllMovements: () => {}
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

<<<<<<< HEAD
  it('should dismiss the alert when leaving the page', () => {
=======

  it("should dismiss the alert when leaving the page", () => {
>>>>>>> fe1feac8813acb9cbd3248540d796f9397e807e6
    component.ngOnDestroy();
    expect(alertSpy.dismiss).toHaveBeenCalled();
  });
});
