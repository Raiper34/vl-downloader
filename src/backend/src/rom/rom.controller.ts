import {Body, Controller, Get, Param, Post, Res, StreamableFile} from '@nestjs/common';
import {RomService} from "./rom.service";
import {RomEntity} from "./rom.entity";
import {createReadStream} from "node:fs";

@Controller('rom')
export class RomController {

    constructor(private readonly romService: RomService) { }

    @Get()
    getAll(): Promise<RomEntity[]> {
        return this.romService.getAll();
    }

    @Post()
    processUrl(@Body() {url}: {url: string}): Promise<void> {
        return this.romService.create(url);
    }
}
