import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { SystemConfigModule } from '../../../apps/api-admin/src/system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceEntity]),
    SystemConfigModule,
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule { }
