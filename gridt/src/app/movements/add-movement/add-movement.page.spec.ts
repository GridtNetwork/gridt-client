import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { AddMovementPage } from './add-movement.page';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('AddMovementPage', () => {
  let component: AddMovementPage;
  let fixture: ComponentFixture<AddMovementPage>;

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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMovementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
