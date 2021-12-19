import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconSelectComponent } from './icon-select.component';

describe('IconSelectComponent', () => {
  let component: IconSelectComponent;
  let fixture: ComponentFixture<IconSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
