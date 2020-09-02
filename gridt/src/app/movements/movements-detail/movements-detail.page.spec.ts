import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { MovementsDetailPage } from './movements-detail.page';
import { AuthService } from 'src/app/core/auth.service';
import { of } from 'rxjs';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('MovementsDetailPage', () => {
  let component: MovementsDetailPage;
  let fixture: ComponentFixture<MovementsDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementsDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ 
        RouterTestingModule.withRoutes([]), 
        HttpClientModule 
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementsDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
