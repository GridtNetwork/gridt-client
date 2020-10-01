import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientModule, HttpHeaders } from "@angular/common/http";
import { MovementsDetailPage } from "./movements-detail.page";
import { AuthService } from "src/app/core/auth.service";
import { of } from "rxjs";
import { AlertController } from "@ionic/angular";

const default_headers = {
  headers: new HttpHeaders({
    Authorization: "JWT aksdajskd.asdjknaskdn.asdjknakdnasjd"
  })
};

class AuthServiceStub {
  isLoggedIn$ = of(true);
  readyAuthentication$ = of(default_headers)
}

describe("MovementsDetailPage", () => {
  let component: MovementsDetailPage;
  let fixture: ComponentFixture<MovementsDetailPage>;
  let alertSpy: AlertController = jasmine.createSpyObj("alertSpy", ["create", "dismiss"]);


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementsDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: AlertController, useValue: alertSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementsDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss the alert when leaving the page', () => {
    component.ngOnDestroy();
    expect(alertSpy.dismiss).toHaveBeenCalled();
  });

  it("should unsubscribe all subscriptions when leaving the page", () => {
    component['movSubSubscription'] = of(true).subscribe();
    component['movUnsubSubscription'] = of(true).subscribe();
    component.ngOnDestroy();
    expect(component['movSubSubscription'].closed).toBeTruthy();
    expect(component['movUnsubSubscription'].closed).toBeTruthy();
  });
});
