import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingNewComponent } from './mapping-new.component';

describe('MappingNewComponent', () => {
  let component: MappingNewComponent;
  let fixture: ComponentFixture<MappingNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
