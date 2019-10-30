import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementJoinComponent } from './movement-join.component';

describe('MovementJoinPage', () => {
  let component: MovementJoinComponent;
  let fixture: ComponentFixture<MovementJoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementJoinComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
