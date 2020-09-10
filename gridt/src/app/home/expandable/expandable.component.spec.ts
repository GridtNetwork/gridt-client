import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpandableComponent } from './expandable.component';
import { By } from '@angular/platform-browser';

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

  it('should toggle itemExpanded', () => {
    component.signalMessage = "this message is long enough to require more space.";
    expect(component.itemExpanded).toBe(false, 'false at first');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(true, 'true after toggle');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(false, 'false after second toggle');
  });

  it('should toggleFullMessage on click', (done) => {
    spyOn(component, 'toggleFullMessage');

    let button = fixture.debugElement.query(By.css('.expand-wrapper')).nativeElement;
    button.click();

    fixture.whenStable().then(() => {
      expect(component.toggleFullMessage).toHaveBeenCalled();
    });
    done();
  });

  it('should show the expanded view', () => {
    component.signalMessage = "this message is long enough to require more space.";
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(true, 'true after toggle');
    let expandedEl = fixture.debugElement.query(By.css('.expand-wrapper, .expanded')).nativeElement;
    expect(expandedEl.innerHTML).not.toBeNull();
  });
});
