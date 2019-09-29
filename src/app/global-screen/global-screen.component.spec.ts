import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalScreenComponent } from './global-screen.component';

describe('GlobalScreenComponent', () => {
  let component: GlobalScreenComponent;
  let fixture: ComponentFixture<GlobalScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
