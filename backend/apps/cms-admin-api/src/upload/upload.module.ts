import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { StorageModule } from '@app/storage';

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
})
export class UploadModule {}
