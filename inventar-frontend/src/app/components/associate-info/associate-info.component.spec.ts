import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateInfoComponent } from './associate-info.component';

describe('AssociateInfoComponent', () => {
  let component: AssociateInfoComponent;
  let fixture: ComponentFixture<AssociateInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
