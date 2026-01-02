import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallCategoryService } from './category.service';
import { MallCategoryController } from './category.controller';
import { MallCategoryEntity } from '@app/db/entities/mall-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MallCategoryEntity])],
  controllers: [MallCategoryController],
  providers: [MallCategoryService],
  exports: [MallCategoryService], // Export in case used elsewhere
})
export class MallCategoryModule {}
