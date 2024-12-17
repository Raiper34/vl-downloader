import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {RomService} from "./rom.service";
import {RomEntity} from "./rom.entity";

@Processor('download')
export class RomConsumer extends WorkerHost {

    constructor(private readonly romService: RomService) {
        super();
    }

    async process(job: Job<RomEntity, any, string>): Promise<any> {
        switch (job.name) {
            case 'download': {
                await this.romService.download(job.data);
                return {};
            }
        }
    }
}
