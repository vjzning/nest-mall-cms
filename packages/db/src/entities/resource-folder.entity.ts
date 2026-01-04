import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ResourceEntity } from './resource.entity';

@Entity('cms_resource_folder')
export class ResourceFolderEntity extends BaseEntity {
  @Column({ length: 100, comment: '目录名称' })
  name: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true, comment: '父级目录ID' })
  parentId: number;

  @ManyToOne(() => ResourceFolderEntity, (folder) => folder.children)
  @JoinColumn({ name: 'parent_id' })
  parent: ResourceFolderEntity;

  @OneToMany(() => ResourceFolderEntity, (folder) => folder.parent)
  children: ResourceFolderEntity[];

  @OneToMany(() => ResourceEntity, (resource) => resource.folder)
  resources: ResourceEntity[];

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;
}
