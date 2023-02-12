import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

import { AboutPage } from './about.page';

describe('AboutPage', () => {
  let component: AboutPage;
  let fixture: ComponentFixture<AboutPage>;
  let modalSpy: ModalController = jasmine.createSpyObj("modalSpy", ['create', 'present', 'dismiss']);

  beforeEach(async(() => {
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

  // If the page is changed, the modal should close
  it('should close any modal upon navigating away', () => {
    component.ngOnDestroy();
    expect(modalSpy.dismiss).toHaveBeenCalled();
  });
});
