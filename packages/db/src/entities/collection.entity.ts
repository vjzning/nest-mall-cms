import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CollectionItemEntity } from './collection-item.entity';
import { CollectionType, CollectionLayout } from '@app/shared';

@Entity('mall_collection')
export class CollectionEntity extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: CollectionType;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'layout_type', type: 'varchar', length: 50, default: CollectionLayout.GRID })
  layoutType: CollectionLayout;

  @Column({ name: 'bg_color', nullable: true })
  bgColor: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ name: 'start_at', nullable: true })
  startAt: Date;

  @Column({ name: 'end_at', nullable: true })
  endAt: Date;

  @OneToMany('CollectionItemEntity', 'collection')
  items: CollectionItemEntity[];
}
