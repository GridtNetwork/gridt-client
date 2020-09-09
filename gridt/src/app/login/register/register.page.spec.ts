import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { IonicModule, AlertController } from "@ionic/angular";

import { RegisterPage } from "./register.page";

describe("RegisterPage", () => {
  //testing suite, (de pagina te testen)
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let alertSpy: AlertController = jasmine.createSpyObj("alertSpy", {
    "create": {
      "present": function() {
        return true
      }},
    "dismiss": function() {
      return true
    }}
  );
//worden elke test opnieuw geladen
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        FormsModule,
        IonicModule,
      ],
      providers: [{
        provide: AlertController,
        useValue: alertSpy
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should alert the user when opening the page", () => {
    expect(alertSpy.create).toHaveBeenCalled();
  });

  it("should dismiss the alert when leaving the page", () => {
    component.ngOnDestroy();
    expect(alertSpy.dismiss).toHaveBeenCalled();
  });
});
