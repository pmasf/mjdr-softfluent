import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GmScreenComponent } from './gm-screen.component';

describe('GmScreenComponent', () => {
  let component: GmScreenComponent;
  let fixture: ComponentFixture<GmScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GmScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GmScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
