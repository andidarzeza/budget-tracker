import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingsComponent } from './incomings.component';

describe('IncomingsComponent', () => {
  let component: IncomingsComponent;
  let fixture: ComponentFixture<IncomingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
