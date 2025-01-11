import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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
}