import { Test, TestingModule } from '@nestjs/testing';
import { RomService } from './rom.service';

describe('RomService', () => {
  let service: RomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RomService],
    }).compile();

    service = module.get<RomService>(RomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
