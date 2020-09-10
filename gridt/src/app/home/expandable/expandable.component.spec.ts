import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpandableComponent } from './expandable.component';

describe('ExpandableComponent', () => {
  let component: ExpandableComponent;
  let fixture: ComponentFixture<ExpandableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandableComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a value for expanded', () => {
    component.expanded = true;
    expect(component.expanded).toBe(true);
    expect()
    component.expanded = false;
    expect(component.expanded).toBe(false);
  });

});
