import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CreateDateColumn } from "typeorm/browser";
import { PrimaryGeneratedColumn } from "typeorm/browser";
import { Spot } from "../spots/spot.entity";

export enum GuestCheckStatus {
    OPENED = 'open',
    CLOSED = 'closed'
}

@Entity('guest_checks')
export class GuestCheck {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({
        type: 'enum',
        enum: GuestCheckStatus,
        default: GuestCheckStatus.OPENED
    })
    status: GuestCheckStatus;
    @ManyToOne(() => Spot, {nullable: false})
    @JoinColumn({name: 'spot_id'})
    spot: Spot;


}