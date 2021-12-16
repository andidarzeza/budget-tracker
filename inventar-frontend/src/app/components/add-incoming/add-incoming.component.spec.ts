import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncomingComponent } from './add-incoming.component';

describe('AddIncomingComponent', () => {
  let component: AddIncomingComponent;
  let fixture: ComponentFixture<AddIncomingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIncomingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIncomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
