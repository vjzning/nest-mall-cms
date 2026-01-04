import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';
import { ResourceFolderController } from './resource-folder.controller';
import { ResourceFolderService } from './resource-folder.service';
import { StorageModule } from '@app/storage';
import { ResourceFolderEntity, ResourceEntity } from '@app/db';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceFolderEntity, ResourceEntity]),
    StorageModule,
  ],
  controllers: [UploadController, ResourceFolderController],
  providers: [ResourceFolderService],
})
export class UploadModule {}
