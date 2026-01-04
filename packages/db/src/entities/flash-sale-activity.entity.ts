import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum FlashSaleStatus {
    DISABLED = 0,
    ENABLED = 1,
}

@Entity('flash_sale_activities')
export class FlashSaleActivityEntity extends BaseEntity {
    @Column({ length: 100, comment: '活动名称' })
    title: string;

    @Column({ length: 255, nullable: true, comment: '活动海报' })
    bannerUrl: string;

    @Column({ type: 'timestamp', comment: '开始时间' })
    @Index()
    startTime: Date;

    @Column({ type: 'timestamp', comment: '结束时间' })
    @Index()
    endTime: Date;

    @Column({
        type: 'tinyint',
        default: FlashSaleStatus.ENABLED,
        comment: '状态: 0禁用, 1启用',
    })
    status: number;

    @Column({ length: 255, nullable: true, comment: '活动备注' })
    remark: string;
}
