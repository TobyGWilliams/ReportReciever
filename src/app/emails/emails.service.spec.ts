import { TestBed, inject } from '@angular/core/testing';

import { EmailsService } from './emails.service';

describe('EmailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailsService]
    });
  });

  it('should be created', inject([EmailsService], (service: EmailsService) => {
    expect(service).toBeTruthy();
  }));
});
