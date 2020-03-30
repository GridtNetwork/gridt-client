import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../api/api.service';

import { ProfilePage } from './profile.page';
import { BehaviorSubject } from 'rxjs';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let ApiSpy: ApiService;

  beforeEach(async(() => {
    ApiSpy = jasmine.createSpyObj('ApiService', { 
      isLoggedIn$: new BehaviorSubject(true)
    });

    TestBed.configureTestingModule({
      declarations: [ ProfilePage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: ApiSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
