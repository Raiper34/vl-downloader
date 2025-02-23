import {Injectable, Logger} from '@nestjs/common';
import {RomEntity} from "../../rom/rom.entity";
import puppeteer, {Browser, CDPSession, Page} from "puppeteer";
import {EventEmitter2} from "@nestjs/event-emitter";

enum PuppeteerDownloadingState {
    Completed = 'completed',
    Canceled = 'canceled',
}
enum PuppeteerEvents {
    DownloadWillBegin = 'Page.downloadWillBegin',
    DownloadProgress = 'Page.downloadProgress',
    SetDownloadBehavior = 'Page.setDownloadBehavior',
}

const SELECTORS = {
    cookieButton: '#qc-cmp2-container button[mode="primary"]',
    titleMeta: 'document.querySelector("meta[property=\'og:title\']").getAttribute("content")',
    downloadButton: '#dl_form button',
    acknowledgeButton: 'input[value="Continue"]',
}

const PUPPETEER_SETTINGS = {
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
};

@Injectable()
export class DownloadService {

    private readonly logger = new Logger(DownloadService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2
    ) { }

    async download(romUrl: string, eventName: string, downloadPath: string, updateFn: (val: Partial<RomEntity>) => Promise<void>): Promise<void> {
        let browser: Browser;
        let page: Page;
        const closeBrowserFn = async () => {
            browser && await browser.close();
            this.logger.debug('Browser closed before downloading');
        }
        this.eventEmitter.once(eventName, closeBrowserFn);
        try {
            this.logger.debug(`Starting Chrome`);
            browser = await puppeteer.launch(PUPPETEER_SETTINGS);
            page = await browser.newPage();
            // Enable CDP
            const client = await page.target().createCDPSession();
            // Set download behavior
            await client.send(PuppeteerEvents.SetDownloadBehavior, {behavior: 'allow', downloadPath});
            this.logger.debug(`Go to ${romUrl}`);
            await page.goto(romUrl);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
        // Allow cookies
        try {
            await page.click(SELECTORS.cookieButton);
        } catch(e) {
            this.logger.debug(`Cookie button not found`);
        }
        //Get meta data
        const name = await page.evaluate(SELECTORS.titleMeta) as string;
        this.logger.debug(`Name of rom is ${name}`)
        await updateFn({name});
        // Click download button
        await page.click(SELECTORS.downloadButton);
        this.logger.debug(`Download clicked`);
        this.logger.debug(`Download folder is ${downloadPath}`);
        try {
            await Promise.any([
                page.click(SELECTORS.acknowledgeButton),
                (page as any)._client().on(PuppeteerEvents.DownloadWillBegin, async ({suggestedFilename}) => {
                    this.logger.debug(`File name is ${suggestedFilename}`);
                    await updateFn({fileName: suggestedFilename});
                })
            ]);
        } catch(error) {
            this.logger.debug(`Prompt button not found, but also not download`);
            throw error;
        }
        // Monitor download progress
        try {
            await Promise.any([
                this.waitForDownload((page as any)._client(), updateFn),
                this.cancelDownloading(eventName),
            ]);
        } catch (error) {
            throw error;
        } finally {
            // Wait for some time to ensure download starts
            this.eventEmitter.removeListener(eventName, closeBrowserFn);
            browser && await browser.close();
            this.logger.debug('Browser closed');
        }
    }

    private waitForDownload(client: CDPSession, updateFn: (val: Partial<RomEntity>) => Promise<void>): Promise<void> {
        return new Promise((resolve, reject) => {
            client.on(PuppeteerEvents.DownloadProgress, async (event) => {
                await updateFn({totalBytes: event.totalBytes, receivedBytes: event.receivedBytes});
                this.logger.debug((event.receivedBytes * 100) / event.totalBytes);
                if (event.state === PuppeteerDownloadingState.Completed) {
                    this.logger.debug('Completed');
                    await updateFn({totalBytes: event.totalBytes, receivedBytes: event.totalBytes});
                    resolve();
                } else if (event.state === PuppeteerDownloadingState.Canceled) {
                    reject('Canceled');
                }
            });
        });
    }

    private cancelDownloading(eventName: string): Promise<void> {
        return new Promise((resolve) => this.eventEmitter.once(eventName, resolve));
    }
}
