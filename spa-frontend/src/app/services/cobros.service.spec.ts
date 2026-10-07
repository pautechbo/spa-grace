import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { CobrosService } from './cobros.service';

describe('CobrosService', () => {
  let service: CobrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(CobrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
