import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { UserEntity } from '@app/db/entities/user.entity';
import { StorageDriver } from './storage.interface';
import { LocalStorageDriver } from './drivers/local.driver';
import { AliyunOssDriver, AliyunOssConfig } from './drivers/aliyun-oss.driver';
import { AwsS3Driver, AwsS3Config } from './drivers/aws-s3.driver';
import { SystemConfigService } from '../../../apps/cms-admin-api/src/system-config/system-config.service';

@Injectable()
export class StorageService implements OnModuleInit {
  private driver: StorageDriver;
  private currentDriverName: string = 'local';
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(ResourceEntity)
    private resourceRepository: Repository<ResourceEntity>,
    private configService: SystemConfigService,
  ) {
    // Default to local
    this.driver = new LocalStorageDriver();
  }

  async onModuleInit() {
    // Initial load
    await this.refreshDriver();
    // In a real app, we might want to subscribe to config changes.
    // Since SystemConfigService uses Redis Pub/Sub to refresh its own cache,
    // we could also expose an event or just check on demand.
    // For simplicity, we'll reload config on each upload or rely on a manual refresh mechanism if needed.
    // Or better: SystemConfigService could expose an observable. 
    // Given the current architecture, we will simply reload the driver configuration 
    // at the beginning of upload/delete operations to ensure we use the latest settings,
    // OR we can trust the cache in SystemConfigService and just rebuild the driver if the "active_driver" value changed.
    
    // Actually, rebuilding the driver on every request is expensive.
    // We can rely on SystemConfigService's cache being up-to-date.
    // But we need to know when to rebuild the driver instance (e.g. credentials changed).
    // For now, let's rebuild only if the driver TYPE changes, or maybe just rebuild on every operation for simplicity/safety 
    // (creating a driver instance is lightweight, usually just config validation).
  }

  private getDriver(driverName: string): StorageDriver {
    switch (driverName) {
      case 'aliyun-oss':
        const ossConfig: AliyunOssConfig = {
          region: this.configService.get('storage.oss.region') || '',
          accessKeyId: this.configService.get('storage.oss.accessKeyId') || '',
          accessKeySecret: this.configService.get('storage.oss.accessKeySecret') || '',
          bucket: this.configService.get('storage.oss.bucket') || '',
          endpoint: this.configService.get('storage.oss.endpoint'),
        };
        // Basic validation
        if (!ossConfig.accessKeyId || !ossConfig.bucket) {
             this.logger.warn('Aliyun OSS config missing, falling back to local');
             return new LocalStorageDriver();
        }
        return new AliyunOssDriver(ossConfig);

      case 'aws-s3':
        const s3Config: AwsS3Config = {
          region: this.configService.get('storage.s3.region') || '',
          accessKeyId: this.configService.get('storage.s3.accessKeyId') || '',
          secretAccessKey: this.configService.get('storage.s3.secretAccessKey') || '',
          bucket: this.configService.get('storage.s3.bucket') || '',
          endpoint: this.configService.get('storage.s3.endpoint'),
        };
        if (!s3Config.accessKeyId || !s3Config.bucket) {
             this.logger.warn('AWS S3 config missing, falling back to local');
             return new LocalStorageDriver();
        }
        return new AwsS3Driver(s3Config);

      case 'local':
      default:
        return new LocalStorageDriver();
    }
  }

  private async refreshDriver() {
      const activeDriver = this.configService.get('storage.active_driver') || 'local';
      this.currentDriverName = activeDriver;
      this.driver = this.getDriver(activeDriver);
  }

  async upload(file: Express.Multer.File, user: UserEntity): Promise<ResourceEntity> {
    // Refresh driver to ensure latest config
    await this.refreshDriver();
    
    const { url, path } = await this.driver.put(file);

    const resource = this.resourceRepository.create({
      originalName: file.originalname,
      filename: file.filename || path.split('/').pop(),
      path,
      url,
      mimeType: file.mimetype,
      size: file.size,
      driver: this.currentDriverName,
      uploader: user,
    });

    return this.resourceRepository.save(resource);
  }

  async remove(id: number): Promise<void> {
    const resource = await this.resourceRepository.findOne({ where: { id } });
    if (!resource) {
      return;
    }

    // Use the driver that was used to upload the file
    // We instantiate a temporary driver based on the resource's driver type
    // Note: This assumes the credentials for that driver are still valid in SystemConfig
    let resourceDriver: StorageDriver;
    try {
        resourceDriver = this.getDriver(resource.driver);
    } catch (e) {
        this.logger.warn(`Could not instantiate driver ${resource.driver}, falling back to current driver`);
        resourceDriver = this.driver;
    }

    // Try to delete file from storage
    try {
      await resourceDriver.delete(resource.path);
    } catch (error) {
      console.warn(`Failed to delete file at ${resource.path}:`, error);
    }

    // Delete record from database
    await this.resourceRepository.remove(resource);
  }
}
