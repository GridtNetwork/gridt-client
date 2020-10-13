import { of } from "rxjs";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientModule, HttpHeaders } from "@angular/common/http";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { AddMovementPage } from "./add-movement.page";
import { AuthService } from "src/app/core/auth.service";
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

describe("AddMovementPage", () => {
  let component: AddMovementPage;
  let fixture: ComponentFixture<AddMovementPage>;
  let alertSpy: AlertController = jasmine.createSpyObj("alertSpy", ["create", "dismiss"]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMovementPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: AlertController, useValue: alertSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMovementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should dismiss the alert when leaving the page", () => {
    component.ngOnDestroy();
    expect(alertSpy.dismiss).toHaveBeenCalled();
  });

  it("should not disable the confirm button when the form is valid", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "this is a short description",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).not.toBeTruthy();
  });

  it("should not disable the confirm button when only the description is missing", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "this is a short description",
      interval: "daily",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).not.toBeTruthy();
  });

  it("should disable the confirm button when the form is empty", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    expect(submitEl.disabled).toBeTruthy();
  });

  it("should disable the confirm button when the name is filled in incorrectly", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      short_description: "this is a short description",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBeTruthy();
  });

  it("should disable the confirm button when the short description is filled in incorrectly", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "short",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBe(true);
  });

  it("should disable the confirm button when the short description is missing", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBe(true);
  });

  it("should disable the confirm button when the interval is filled in incorrectly", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "this is a short description",
      description: "this is a longer description than the short description to be able to tell the difference",
      category: "Community",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBe(true);
  });

  it("should disable the confirm button when the category is filled in incorrectly", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "this is a short description",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      location: "Groningen"
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBe(true);
  });

  it("should disable the confirm button when the location is filled in incorrectly", () => {
    const submitEl = fixture.debugElement.nativeElement.querySelector("#confirmCreation");
    const compiled = fixture.componentInstance;
    compiled.form.patchValue({
      name: "test",
      short_description: "this is a short description",
      description: "this is a longer description than the short description to be able to tell the difference",
      interval: "daily",
      category: "Community",
    });
    fixture.detectChanges();
    expect(submitEl.disabled).toBe(true);
  });
});
