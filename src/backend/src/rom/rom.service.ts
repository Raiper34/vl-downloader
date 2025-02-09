import {Injectable, Logger} from '@nestjs/common';
import {Queue} from "bullmq";
import {InjectQueue} from "@nestjs/bullmq";
import {RomEntity, TrackStatusEnum} from "./rom.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {Server} from 'socket.io';
import {UtilsService} from "../shared/services/utils.service";
import {EventEmitter2} from "@nestjs/event-emitter";
import {DownloadService} from "../shared/services/download.service";

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
        private readonly eventEmitter: EventEmitter2,
        private readonly utilsService: UtilsService,
        private readonly downloadService: DownloadService,
    ) {}

    get(id: number): Promise<RomEntity> {
        return this.repository.findOne({where: {id}});
    }

    getAll(): Promise<RomEntity[]> {
        return this.repository.find();
    }

    async remove(id: number): Promise<void> {
        await this.repository.delete(id);
        this.eventEmitter.emit(this.getEventName(id))
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
        if (dbRom) {
            await this.update(id, {...dbRom, ...partialRom});
        }
    }

    async download(rom: RomEntity): Promise<void> {
        if (await this.get(rom.id)) {
            await this.updatePartial(rom.id, {status: TrackStatusEnum.Downloading});
            try {
                await this.downloadService.download(rom.url, this.getEventName(rom.id), this.utilsService.getDownloadFolderPath(), (val: Partial<RomEntity>) =>
                    this.updatePartial(rom.id, val)
                );
            } catch (error) {
                await this.updatePartial(rom.id, {error: String(error), status: TrackStatusEnum.Error});
            }
            await this.updatePartial(rom.id, {status: TrackStatusEnum.Completed});
        }
    }

    private getJobId(id: number): string {
        return `id-${id}`;
    }

    private getEventName(id: number): string {
        return `cancel.${id}`
    }
}
