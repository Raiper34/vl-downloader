import { Module } from '@nestjs/common';
import { UtilsService } from './services/utils.service';
import {ConfigModule} from "@nestjs/config";
import {DownloadService} from "./services/download.service";

@Module({
  imports: [ConfigModule],
  providers: [UtilsService, DownloadService],
  controllers: [],
  exports: [UtilsService, DownloadService],
})
export class SharedModule {}
