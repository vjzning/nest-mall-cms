import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { ResourceEntity } from '@app/db/entities/resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceEntity])],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
