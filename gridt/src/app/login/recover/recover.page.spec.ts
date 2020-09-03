import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RecoverPage } from './recover.page';

describe('RecoverPage', () => {
  let component: RecoverPage;
  let fixture: ComponentFixture<RecoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        FormsModule,
        IonicModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with an email field', () => {});

  it('should request a password reset upon form submit', () => {});

  it('should display a success message after submit', () => {});

  it('should disable form upon submit', () => {});
});
