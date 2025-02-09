import {Body, Controller, Delete, Get, Param, Post, Res, StreamableFile} from '@nestjs/common';
import {RomService} from "./rom.service";
import {RomEntity} from "./rom.entity";
import {UtilsService} from "../shared/services/utils.service";
import { createReadStream } from 'fs';
import type { Response } from 'express';

@Controller('rom')
export class RomController {

    constructor(private readonly romService: RomService,
                private readonly utilsService: UtilsService) { }

    @Get()
    getAll(): Promise<RomEntity[]> {
        return this.romService.getAll();
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
        return this.romService.remove(id);
    }

    @Get('retry/:id')
    retry(@Param('id') id: number): Promise<void> {
        return this.romService.retry(id);
    }

    @Post()
    processUrl(@Body() {url}: {url: string}): Promise<void> {
        return this.romService.create(url);
    }

    @Get('download/:id')
    async getFile(
        @Res({ passthrough: true }) res: Response,
        @Param('id') id: number,
    ): Promise<StreamableFile> {
        const rom = await this.romService.get(id);
        const readStream = createReadStream(
            this.utilsService.getDownloadFolderPath(rom.fileName),
        );
        res.set({ 'Content-Disposition': `attachment; filename="${rom.fileName}` });
        return new StreamableFile(readStream);
    }
}
