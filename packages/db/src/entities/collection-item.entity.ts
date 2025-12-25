import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('mall_collection_item')
export class CollectionItemEntity extends BaseEntity {
  @Column({ name: 'collection_id', type: 'bigint' })
  collectionId: number;

  @ManyToOne('CollectionEntity', 'items')
  @JoinColumn({ name: 'collection_id' })
  collection: any;

  @Column({ name: 'target_id', type: 'bigint' })
  targetId: number;

  @Column({ name: 'title_override', nullable: true })
  titleOverride: string;

  @Column({ name: 'image_override', nullable: true })
  imageOverride: string;

  @Column({ name: 'extra_tag', nullable: true })
  extraTag: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
