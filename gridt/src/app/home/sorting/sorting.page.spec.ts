import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SortingPage } from './sorting.page';

describe('SortingPage', () => {
  let component: SortingPage;
  let fixture: ComponentFixture<SortingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SortingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
