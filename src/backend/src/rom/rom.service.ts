import {Injectable, Logger} from '@nestjs/common';
import {Queue} from "bullmq";
import {InjectQueue} from "@nestjs/bullmq";
import puppeteer, {Browser, CDPSession, Page} from "puppeteer";
import {RomEntity} from "./rom.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import { Server } from 'socket.io';
import {UtilsService} from "../shared/utils/utils.service";

enum WsOperation {
    New = 'new',
    Update = 'update',
    Delete = 'delete',
}

@WebSocketGateway()
@Injectable()
export class RomService {
    @WebSocketServer() io: Server;
    private readonly logger = new Logger(RomService.name);

    constructor(
        @InjectRepository(RomEntity) private repository: Repository<RomEntity>,
        @InjectQueue('download') private downloadQueue: Queue,
        private readonly utilsService: UtilsService,
    ) {}

    get(id: number): Promise<RomEntity> {
        return this.repository.findOne({where: {id}});
    }

    getAll(): Promise<RomEntity[]> {
        return this.repository.find();
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
        const job = await this.downloadQueue.getJob(this.getJobId(id));
        job?.remove();
        this.io.emit(WsOperation.Delete, { id });
    }

    async retry(id: number): Promise<void> {
        // TODO
        /*const rom = await this.repository.findOne({where: {id}});
        const job = await this.downloadQueue.getJob(this.getJobId(rom.id));
        job?.cancel();
        await this.downloadQueue.add('download', rom, {jobId: this.getJobId(rom.id)});*/
    }

    async create(url: string): Promise<void> {
        const savedRom = await this.repository.save({url});
        await this.downloadQueue.add('download', savedRom, {jobId: this.getJobId(savedRom.id)});
        this.io.emit(WsOperation.New, savedRom);
    }

    async update(id: number, rom: RomEntity): Promise<void> {
        await this.repository.update(id, rom);
        this.io.emit(WsOperation.Update, rom);
    }

    async updatePartial(id: number, partialRom: Partial<RomEntity>): Promise<void> {
        const dbRom = await this.get(id);
        await this.update(id, {...dbRom, ...partialRom});
    }

    async download(rom: RomEntity): Promise<void> {
        let browser: Browser;
        let page: Page;
        try {
            this.logger.debug(`Starting Chrome`);
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
            });
            page = await browser.newPage();
            // Enable CDP
            const client = await page.target().createCDPSession();
            // Set download behavior
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: this.utilsService.getDownloadFolderPath(),
            });
            console.log(this.utilsService.getDownloadFolderPath());
            this.logger.debug(`Go to ${rom.url}`);
            await page.goto(rom.url);
        } catch (error) {
            this.logger.error(error);
        }
        // Allow cookies
        try {
            await page.click('#qc-cmp2-container button[mode="primary"]');
        } catch(e) {
            this.logger.debug(`Cookie button not found`);
        }
        //Get meta data
        const name = await page.evaluate('document.querySelector("meta[property=\'og:title\']").getAttribute("content")') as string;
        this.logger.debug(`Name of rom is ${name}`)
        await this.updatePartial(rom.id, {name});
        // Click download button
        await page.click('#dl_form button');
        this.logger.debug(`Download clicked`);
        try {
            await Promise.any([
                page.click('input[value="Continue"]'),
                (page as any)._client().on('Page.downloadWillBegin', async ({suggestedFilename}) => {
                    await this.updatePartial(rom.id, {fileName: suggestedFilename});
                })
            ]);
        } catch(e) {
            this.logger.debug(`Prompt button not found, but also not download`);
        }
        // Monitor download progress
        try {
            await this.waitForDownload((page as any)._client(), rom.id);
        } catch (e) {
            // pass
        } finally {
            // Wait for some time to ensure download starts
            await browser.close();
        }
    }

    private waitForDownload(client: CDPSession, romId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            client.on('Page.downloadProgress', async (event) => {
                await this.updatePartial(romId, {totalBytes: event.totalBytes, receivedBytes: event.receivedBytes});
                this.logger.debug((event.receivedBytes * 100) / event.totalBytes);
                if (event.state === 'completed') {
                    this.logger.debug(event);
                    await this.updatePartial(romId, {totalBytes: event.totalBytes, receivedBytes: event.totalBytes});
                    resolve();
                } else if (event.state === 'canceled') {
                    reject();
                }
            });
        });
    }

    private getJobId(id: number): string {
        return `id-${id}`;
    }
}
