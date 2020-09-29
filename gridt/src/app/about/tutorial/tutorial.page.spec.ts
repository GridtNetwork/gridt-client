import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { TutorialPage } from './tutorial.page';

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;
  let routerSpy: Router = jasmine.createSpyObj("routerSpy", ['navigate', 'navigateByUrl']);
  let modalSpy: ModalController = jasmine.createSpyObj("modalSpy", ['create', 'present', 'dismiss']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialPage ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //It should navigate to movements if finish is clicked on homepage
  it('should navigate to movements if finish is called', () => {
    component.finish();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/movements');
  });
});
