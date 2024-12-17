import { Module } from '@nestjs/common';
import { RomController } from './rom.controller';
import { RomService } from './rom.service';
import {BullModule} from "@nestjs/bullmq";
import {RomConsumer} from "./rom.consumer";
import {RomEntity} from "./rom.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([RomEntity]),
    BullModule.registerQueue({
      name: 'download',
    }),
  ],
  controllers: [
      RomController,
  ],
  providers: [RomService, RomConsumer]
})
export class RomModule {}
