import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_menu')
export class MenuEntity extends BaseEntity {
  @Column({ name: 'parent_id', type: 'bigint', nullable: true, default: 0 })
  parentId: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ type: 'tinyint', comment: '1: Directory, 2: Menu, 3: Button' })
  type: number;

  @Column({ length: 200, nullable: true })
  path: string;

  @Column({ length: 255, nullable: true })
  component: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  sort: number;
}
