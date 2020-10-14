import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SubscriptionHolder } from 'src/app/core/subscription-holder.extendableClass';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        IonicModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should store all subscriptions in the subscriptionHolder", () => {
    spyOn( SubscriptionHolder.prototype, 'getAllSubscriptions');
    expect(component.getAllSubscriptions.length).toBeGreaterThanOrEqual(1);
  });

  it("should unsubscribe all subscriptions when leaving the page", () => {
    spyOn( SubscriptionHolder.prototype, 'cancelAllSubscriptions');
    component.ngOnDestroy();
    expect(SubscriptionHolder.prototype.cancelAllSubscriptions).toHaveBeenCalled();
    expect(SubscriptionHolder.prototype.getAllSubscriptions.length).toBe(0);
  });
});
