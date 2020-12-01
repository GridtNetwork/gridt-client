import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignalPage } from './signal.page';

describe('SignalPage', () => {
  let component: SignalPage;
  let fixture: ComponentFixture<SignalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
