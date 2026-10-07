import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TurnoFormComponent } from './turno-form.component';

describe('TurnoFormComponent', () => {
  let component: TurnoFormComponent;
  let fixture: ComponentFixture<TurnoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [TurnoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
