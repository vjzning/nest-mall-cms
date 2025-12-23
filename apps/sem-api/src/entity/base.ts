import {
  PrimaryGeneratedColumn,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
export abstract class Base {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id?: number;
  @CreateDateColumn({
    type: 'timestamp',
    length: 0,
    comment: '创建时间',
  })
  @Index('create_at')
  create_at?: string;
  @UpdateDateColumn({
    type: 'timestamp',
    length: 0,
    comment: '修改时间',
  })
  update_at?: string;
  @VersionColumn({
    comment: '版本',
    default: 1,
  })
  version?: string;
  @Index('tenant_id')
  @Column({ name: 'tenant_id', type: 'int', comment: '租户ID', default: null })
  tenantId?: number;
  @Column({
    name: 'project_id',
    comment: '项目id',
    default: null,
  })
  projectId?: number;
  @Column({
    default: false,
    name: 'is_del',
  })
  isDel?: boolean;

  @BeforeInsert()
  createDates?() {
    if (!this.create_at) {
      this.create_at = new Date().toJSON();
    }
  }
  @BeforeUpdate()
  updateDates?() {
    this.update_at = new Date().toJSON();
  }
}
