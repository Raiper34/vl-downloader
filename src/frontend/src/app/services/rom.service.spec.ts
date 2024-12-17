import { TestBed } from '@angular/core/testing';

import { RomService } from './rom.service';

describe('RomService', () => {
  let service: RomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
