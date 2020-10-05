import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from "@angular/common"; 
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { routes } from '../../app-routing.module';

import { TutorialPage } from './tutorial.page';

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;
  let routerSpy: Router = jasmine.createSpyObj("routerSpy", ['navigate', 'navigateByUrl']);
  //let modalSpy: ModalController = jasmine.createSpyObj("modalSpy", ['create', 'present', 'dismiss']);
  let modalSpy: ModalController = jasmine.createSpyObj("modalSpy", {
    "create": {
      "present": function() {
        return true
      }},
    "dismiss": function() {
      return true
    }});
  let router: Router;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialPage ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule.withRoutes(routes, {initialNavigation: false})
      ],
      providers: [
        
        { provide: ModalController, useValue: modalSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    console.log(router);
    location = TestBed.get(Location);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //It should navigate to movements if finish is clicked on homepage
  it('should navigate to movements if finish is called on home page', () => {
   component.finishTutorial();
   expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/movements');
  });

  //It sould dismiss if finish is clicked on the about page
  it('should dismiss if finish is called on about page', () => {
    component.finishTutorial();
    expect(modalSpy.dismiss).toHaveBeenCalled();
  });

  it('navigate to "" redirects you to /home', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/home');
  }));
});
