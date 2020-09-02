import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../core/api.service';

import { SettingsPage } from './settings.page';
import { BehaviorSubject } from 'rxjs';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;
  let ApiSpy: ApiService;

  beforeEach(async(() => {
    ApiSpy = jasmine.createSpyObj('ApiService', {
      isLoggedIn$: new BehaviorSubject(true)
    });

    TestBed.configureTestingModule({
      declarations: [ SettingsPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: ApiSpy}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
