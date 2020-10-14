import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { IonicModule, AlertController } from "@ionic/angular";

import { RegisterPage } from "./register.page";
import { SubscriptionHolder } from 'src/app/core/models/subscription-holder.model';

describe("RegisterPage", () => {
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

  it("should unsubscribe all subscriptions when leaving the page", () => {
    spyOn( SubscriptionHolder.prototype, 'cancelAllSubscriptions');
    component.ngOnDestroy();
    expect(SubscriptionHolder.prototype.cancelAllSubscriptions).toHaveBeenCalled();
  });
});
