import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignalMessageComponent } from './expandable.component';
import { By } from '@angular/platform-browser';

describe('ExpandableComponent', () => {
  let component: SignalMessageComponent;
  let fixture: ComponentFixture<SignalMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalMessageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignalMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle itemExpanded', () => {
    component.signalMessage = "this message is long enough to require more space.";
    component.width = 5;
    expect(component.itemExpanded).toBe(false, 'false at first');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(true, 'true after toggle');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(false, 'false after second toggle');
  });

  it('should not toggle itemExpanded', () => {
    component.signalMessage = "this message is long enough to require more space.";
    component.width = 100;
    expect(component.itemExpanded).toBe(false, 'false at first');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(false, 'false after toggle');
  });

  it('should toggleFullMessage on click', (done) => {
    spyOn(component, 'toggleFullMessage').and.callThrough();
    component.signalMessage = "this message is long enough to require more space.";
    component.width = 5;

    let button = fixture.debugElement.query(By.css('div')).nativeElement;
    button.click();

    fixture.whenStable().then(() => {
      expect(component.toggleFullMessage).toHaveBeenCalled();
      expect(component.itemExpanded).toBe(true, 'true after toggle');
    });
    done();
  });

  it('should not toggleFullMessage on click', (done) => {
    spyOn(component, 'toggleFullMessage').and.callThrough();
    component.width = 100;
    component.signalMessage = "this message is short enough to not require more space.";

    let button = fixture.debugElement.query(By.css('div')).nativeElement;
    button.click();

    fixture.whenStable().then(() => {
      expect(component.toggleFullMessage).toHaveBeenCalled();
      expect(component.itemExpanded).toBe(false, 'not toggled');
    });
    done();
  });

  it('should show the expanded view', () => {
    component.width = 5;
    component.signalMessage = "this message is long enough to require more space.";
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(true, 'true after toggle');
    let expandedEl = fixture.debugElement.query(By.css('div, .p-expanded')).nativeElement;
    expect(expandedEl.innerHTML).not.toBeNull();
  });
});
