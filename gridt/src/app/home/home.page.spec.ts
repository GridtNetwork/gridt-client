import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { AlertController } from '@ionic/angular';

import { User } from '../core/user.model';
import { HomePage } from './home.page';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { Movement } from '../core/movement.model';

class AuthServiceStub {
  isLoggedIn$ = of(true);
}

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let apiSpy: ApiService;
  let alertSpy: AlertController;

  beforeEach(() => {
    jasmine.clock().install();

    apiSpy = jasmine.createSpyObj('ApiService',
      {
        getSubscriptions: () => {},
        sendSignal$: of("Success"),
        swapLeader$: of({
          id: 1,
          username: "Yori",
          last_signal: {
            time_stamp: (new Date(2020, 3, 7, 9)).toISOString()
          }
        } as User)
      }
    );

    alertSpy = jasmine.createSpyObj('alertSpy', {
      create: new Promise( resolve => resolve({present: () => {}}) )
    });

    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [HttpClientModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should find proper last signals', () => {
    // Daily -> Midnight
    let fake_now = new Date();
    fake_now.setUTCHours(1, 0, 0, 0);
    jasmine.clock().mockDate(fake_now);

    let expected_date = new Date();
    expected_date.setUTCHours(0, 0, 0, 0);
    expect(component.getLastOccurence("daily", 0)).toEqual(expected_date);

    // Twice daily in the morning
    fake_now = new Date();
    fake_now.setUTCHours(9, 0, 0, 0);
    jasmine.clock().mockDate(fake_now);

    expected_date = new Date();
    expected_date.setUTCHours(0, 0, 0, 0);
    expect(component.getLastOccurence("twice daily", 0)).toEqual(expected_date);

    // Twice daily in the after noon
    fake_now = new Date();
    fake_now.setUTCHours(15, 0, 0, 0);
    jasmine.clock().mockDate(fake_now);

    expected_date = new Date();
    expected_date.setUTCHours(12, 0, 0, 0);
    expect(component.getLastOccurence("twice daily", 0)).toEqual(expected_date);

    // Weekly on Tuesday
    fake_now = new Date(2020, 2, 25);
    fake_now.setUTCHours(15, 0, 0, 0);
    jasmine.clock().mockDate(fake_now);

    expected_date = new Date(2020, 2, 23);
    expected_date.setUTCHours(0, 0, 0, 0);
    expect(component.getLastOccurence("weekly", 0)).toEqual(expected_date);

    // Weekly on Monday
    fake_now = new Date(2020, 2, 23);
    fake_now.setUTCHours(15, 0, 0, 0);
    jasmine.clock().mockDate(fake_now);

    expected_date = new Date(2020, 2, 16);
    expected_date.setUTCHours(0, 0, 0, 0);
    expect(component.getLastOccurence("weekly", 0)).toEqual(expected_date);
  });

  it('should display leader as "done" at correct times', () => {
    const movement = {
      name: "Flossing",
      short_description: "Flossing is nice.",
      interval: "daily",
      leaders: [
        {
          id: 1,
          username: "Your Leader",
          last_signal: {
            time_stamp: "2020-03-30 13:51:15.201643+02:00"
          }
        }
      ]
    } as Movement;

    let now = new Date(Date.parse(movement.leaders[0].last_signal.time_stamp));

    // If the signal is 'now', it should definitely be done!
    jasmine.clock().mockDate(now);
    expect(component.isLeaderDone(movement.leaders[0], movement)).toBeTruthy();

    // If the interval is daily and the time stamp was 24 hours ago it should not be done.
    now.setUTCHours(now.getUTCHours() + 24);
    jasmine.clock().mockDate(now);
    expect(component.isLeaderDone(movement.leaders[0], movement)).toBeFalsy();
  });

  it("should allow a user to only send signals when it hasn't yet in the interval of this movement", () => {
    // 2020-04-01 15:00
    let now = new Date(2020, 3, 1, 15, 0);
    jasmine.clock().mockDate(now);

    const movement_with_time_stamp: Movement = {
      name: "Flossing",
      short_description: "Flossing is good for you.",
      interval: "daily",
      last_signal_sent: {
        time_stamp: "2020-04-01 14:00:00+02:00"
      }
    } as Movement;

    const movement_without_time_stamp: Movement = {
      name: "Sleeping on time",
      short_description: "Having enough sleep in a day helps you work well",
      interval: "daily",
      last_signal_sent: null
    } as Movement;

    expect(component.readyToSignal(movement_with_time_stamp)).toBeFalsy();
    expect(component.readyToSignal(movement_without_time_stamp)).toBeTruthy();

    // 2020-04-02 15:00
    now = new Date(2020, 3, 2, 15, 0);
    jasmine.clock().mockDate(now);
    expect(component.readyToSignal(movement_with_time_stamp)).toBeTruthy();
  });

  it('should allow swapping at correct times', () => {
    jasmine.clock().mockDate(new Date(2020, 3, 8, 15));

    let movement = {
      name: "Flossing",
      short_description: "Good for your teeth.",
      interval: "daily",
      leaders: [
        {
          username: "Bad leader",
          id: 1,
          last_signal: {
            time_stamp: '2019-01-01 10:00:00+01:00'
          }
        },
      ]
    } as Movement;

    component.swapLeader(movement, movement.leaders[0]);

    jasmine.clock().mockDate(new Date(2020, 3, 8, 16));
    expect(component.canSwap(movement)).toBeFalsy();

    jasmine.clock().mockDate(new Date(2020, 3, 8, 17));
    movement.last_signal_sent = {time_stamp: '2020-04-08 17:00:00+01:00'};
    expect(component.canSwap(movement)).toBeFalsy();

    jasmine.clock().mockDate(new Date(2020, 3, 9, 10));
    expect(component.canSwap(movement)).toBeFalsy();

    movement.last_signal_sent.time_stamp = '2020-04-09 10:00:00+01:00';
    expect(component.canSwap(movement)).toBeTruthy();
  });
});
