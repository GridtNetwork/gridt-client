import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;
  let modalSpy: ModalController = jasmine.createSpyObj("modalSpy", {
    "create": {
      "present": function() {
        return true
      }},
    "dismiss": function() {
      return true
    }}
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // If the tutorial-controller is opened, should open modal
  it('should open the tutorial-controller modal', () => {
    component.presentTutorial();
    expect(modalSpy.create).toHaveBeenCalled();
  });
  
  // If roll credits-controller is opened, should open modal
  it('should open the credits-controller modal', () => {
    component.presentCredits();
    expect(modalSpy.create).toHaveBeenCalled();
  });

    it('should open the privacy-controller modal', () => {
    component.presentPrivacy();
    expect(modalSpy.create).toHaveBeenCalled();
  });

  // If the page is changed, the modal should close
  it('should close any modal upon navigating away', () => {
    component.ngOnDestroy();
    expect(modalSpy.dismiss).toHaveBeenCalled();
  });
});
