import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_region')
export class RegionEntity extends BaseEntity {
    @Column({ length: 100, comment: '地区名称' })
    name: string;

    @Index({ unique: true })
    @Column({ length: 20, comment: '地区编码' })
    code: string;

    @Index()
    @Column({
        name: 'parent_code',
        length: 20,
        nullable: true,
        comment: '父级编码',
    })
    parentCode: string;

    @Column({ type: 'tinyint', comment: '层级: 1-省, 2-市, 3-区' })
    level: number;

    @Column({ type: 'int', default: 0, comment: '排序' })
    sort: number;
}
