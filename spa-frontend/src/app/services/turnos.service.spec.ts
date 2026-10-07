import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TurnosService } from './turnos.service';

describe('TurnosService', () => {
  let service: TurnosService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(TurnosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
