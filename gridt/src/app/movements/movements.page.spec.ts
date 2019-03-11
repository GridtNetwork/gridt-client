import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementsPage } from './movements.page';

describe('MovementsPage', () => {
  let component: MovementsPage;
  let fixture: ComponentFixture<MovementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
});
