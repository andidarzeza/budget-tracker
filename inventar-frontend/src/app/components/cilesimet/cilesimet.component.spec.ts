import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CilesimetComponent } from './cilesimet.component';

describe('CilesimetComponent', () => {
  let component: CilesimetComponent;
  let fixture: ComponentFixture<CilesimetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CilesimetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CilesimetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
