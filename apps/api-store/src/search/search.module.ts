import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallProductEntity, ArticleEntity } from '@app/db';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [TypeOrmModule.forFeature([MallProductEntity, ArticleEntity])],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule {}
