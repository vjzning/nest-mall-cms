import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_config')
export class SystemConfigEntity extends BaseEntity {
  @Column({ length: 100, unique: true })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ length: 50, default: 'system' })
  group: string;

  @Column({ name: 'is_encrypted', default: false })
  isEncrypted: boolean;

  @Column({ length: 255, nullable: true })
  description: string;
}
