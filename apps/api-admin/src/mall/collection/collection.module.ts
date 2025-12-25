import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity, CollectionItemEntity } from '@app/db';
import { CollectionAdminService } from './collection.service';
import { CollectionAdminController } from './collection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity, CollectionItemEntity]),
  ],
  providers: [CollectionAdminService],
  controllers: [CollectionAdminController],
  exports: [CollectionAdminService],
})
export class CollectionAdminModule { }
