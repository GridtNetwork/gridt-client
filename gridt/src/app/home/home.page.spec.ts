import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { HomePage } from './home.page';

import { ApiService } from '../api/api.service';
import { BehaviorSubject } from 'rxjs';
import { Movement } from '../api/movement.model';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let ApiSpy: ApiService;

  beforeEach(async(() => {
    ApiSpy = jasmine.createSpyObj('ApiService', { 
      isLoggedIn: new BehaviorSubject(true),
      getSubscriptions: () => {}
    });

    jasmine.clock().install;
 
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [IonicModule.forRoot(), HttpClientModule],
      providers: [
        { provide: ApiService, useValue: ApiSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach( () => {
    jasmine.clock().uninstall()
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
});
