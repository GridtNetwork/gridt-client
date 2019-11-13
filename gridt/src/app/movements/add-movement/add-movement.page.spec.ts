import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMovementPage } from './add-movement.page';

describe('AddMovementPage', () => {
  let component: AddMovementPage;
  let fixture: ComponentFixture<AddMovementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMovementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
