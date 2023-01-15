import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientModule, HttpHeaders } from "@angular/common/http";
import { MovementsDetailPage } from "./movements-detail.page";
import { AuthService } from '../../model/services/auth.service';
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


  beforeEach(waitForAsync(() => {
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
});
