import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TutorialPage } from './tutorial.page';

import { Router } from '@angular/router';
import { Location } from "@angular/common"; 
import { routes } from '../app-routing.module';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/model/services/auth.service';
import { of } from 'rxjs';

// Mocking authentication is apparently needed to make the router function properly
const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class authServiceStub_succes {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers);
};

describe('TutorialPage', () => {
  let component: TutorialPage;
  let fixture: ComponentFixture<TutorialPage>;
  let routerSpy: Router = jasmine.createSpyObj("routerSpy", ['url', 'navigate', 'navigateByUrl']);
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
        RouterTestingModule.withRoutes(routes, {initialNavigation: "disabled"}),
        HttpClientModule,
      ],
      providers: [
        { provide: AuthService, useClass: authServiceStub_succes},
        { provide: ModalController, useValue: modalSpy },
        { provide: Router, useValue: routerSpy}
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
  it('should navigate to movements if finish is called on home page', fakeAsync(() => {
    component.url = "/home";
    component.finishTutorial();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/movements');
  }));

  //It sould dismiss if finish is clicked on the about page
  it('should dismiss if finish is called on about page', () => {
    component.finishTutorial();
    expect(modalSpy.dismiss).toHaveBeenCalled();
  });

});
