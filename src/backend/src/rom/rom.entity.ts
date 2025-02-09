import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export enum TrackStatusEnum {
    Queued,
    Downloading,
    Completed,
    Error,
}

@Entity()
export class RomEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    url: string;

    @Column({default: 0})
    totalBytes?: number;

    @Column({default: 0})
    receivedBytes?: number;

    @Column({nullable: true})
    name?: string;

    @Column({nullable: true})
    fileName?: string;

    @Column({nullable: true})
    error?: string;

    @Column({ default: TrackStatusEnum.Queued })
    status: TrackStatusEnum;
}