import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApitestingPage } from './apitesting.page';

describe('ApitestingPage', () => {
  let component: ApitestingPage;
  let fixture: ComponentFixture<ApitestingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApitestingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApitestingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
