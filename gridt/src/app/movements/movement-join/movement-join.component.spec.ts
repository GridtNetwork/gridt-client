import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementJoinPage } from './movement-join.page';

describe('MovementJoinPage', () => {
  let component: MovementJoinPage;
  let fixture: ComponentFixture<MovementJoinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementJoinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementJoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
