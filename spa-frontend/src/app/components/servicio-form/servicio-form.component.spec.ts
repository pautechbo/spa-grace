import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ServicioFormComponent } from './servicio-form.component';

describe('ServicioFormComponent', () => {
  let component: ServicioFormComponent;
  let fixture: ComponentFixture<ServicioFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
      imports: [ServicioFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
