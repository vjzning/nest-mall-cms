import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { SystemConfigModule } from '../../../apps/cms-admin-api/src/system-config/system-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceEntity]),
    SystemConfigModule,
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
