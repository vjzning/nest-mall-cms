import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity, CollectionItemEntity, MallProductEntity } from '@app/db';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollectionEntity, CollectionItemEntity, MallProductEntity]),
  ],
  providers: [CollectionService],
  controllers: [CollectionController],
  exports: [CollectionService],
})
export class CollectionModule { }
