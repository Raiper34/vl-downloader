import { Test, TestingModule } from '@nestjs/testing';
import { RomController } from './rom.controller';

describe('RomController', () => {
  let controller: RomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RomController],
    }).compile();

    controller = module.get<RomController>(RomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
