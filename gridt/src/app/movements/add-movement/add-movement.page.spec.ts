import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AddMovementPage } from './add-movement.page';
import { AuthService } from 'src/app/core/auth.service';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('AddMovementPage', () => {
  let component: AddMovementPage;
  let fixture: ComponentFixture<AddMovementPage>;
  let authSpy: AuthService;

  beforeEach(async(() => {    
    TestBed.configureTestingModule({
      declarations: [ AddMovementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ 
        RouterTestingModule.withRoutes([]), 
        HttpClientModule, 
        FormsModule,
        ReactiveFormsModule 
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    })
    .compileComponents();
  
    fixture = TestBed.createComponent(AddMovementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
