import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateTableComponent } from './associate-table.component';

describe('AssociateTableComponent', () => {
  let component: AssociateTableComponent;
  let fixture: ComponentFixture<AssociateTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
