import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { UserEntity } from '@app/db/entities/user.entity';
import { StorageDriver } from './storage.interface';
import { LocalStorageDriver } from './drivers/local.driver';

@Injectable()
export class StorageService {
  private driver: StorageDriver;

  constructor(
    @InjectRepository(ResourceEntity)
    private resourceRepository: Repository<ResourceEntity>,
  ) {
    // Determine driver based on config (hardcoded to local for now)
    this.driver = new LocalStorageDriver();
  }

  async upload(file: Express.Multer.File, user: UserEntity): Promise<ResourceEntity> {
    const { url, path } = await this.driver.put(file);

    const resource = this.resourceRepository.create({
      originalName: file.originalname,
      filename: file.filename || path.split('/').pop(),
      path,
      url,
      mimeType: file.mimetype,
      size: file.size,
      driver: 'local',
      uploader: user,
    });

    return this.resourceRepository.save(resource);
  }
}
