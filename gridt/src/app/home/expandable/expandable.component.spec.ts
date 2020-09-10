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

  it('should have a value for itemExpanded', () => {
    component.itemExpanded = true;
    expect(component.itemExpanded).toBe(true);
    component.itemExpanded = false;
    expect(component.itemExpanded).toBe(false);
  });

  it('shoould toggle itemExpanded', () => {
    expect(component.itemExpanded).toBe(false, 'false at first');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(true, 'true after toggle');
    component.toggleFullMessage();
    expect(component.itemExpanded).toBe(false, 'false after second toggle');
  });

  it('should toggleFullMessage on click', () => {
    let button = fixture.debugElement.nativeElement.querySelector('#expandable');
    button.click();
    expect(component.toggleFullMessage).toHaveBeenCalled();
  });

  // it ("test css style", async() =>{
  //   component.itemExpanded = false;
  //   let element1= fixture.debugElement.query(By.css('.expand-wrapper')).nativeElement;
  //   expect(element1.innerHTML);

  // });
});
