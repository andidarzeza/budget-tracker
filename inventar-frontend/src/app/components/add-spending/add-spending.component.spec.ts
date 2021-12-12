import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpendingComponent } from './add-spending.component';

describe('AddSpendingComponent', () => {
  let component: AddSpendingComponent;
  let fixture: ComponentFixture<AddSpendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSpendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSpendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
