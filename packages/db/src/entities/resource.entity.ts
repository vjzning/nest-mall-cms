import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { type ResourceFolderEntity } from './resource-folder.entity';

@Entity('cms_resource')
export class ResourceEntity extends BaseEntity {
  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ length: 500 })
  path: string;

  @Column({ length: 500 })
  url: string;

  @Column({ length: 50 })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ length: 20, default: 'local' })
  driver: string;

  @Column({ name: 'folder_id', type: 'bigint', nullable: true, comment: '目录ID' })
  folderId: number;

  @ManyToOne('ResourceFolderEntity', (folder: ResourceFolderEntity) => folder.resources)
  @JoinColumn({ name: 'folder_id' })
  folder: ResourceFolderEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uploader_id' })
  uploader: UserEntity;
}
