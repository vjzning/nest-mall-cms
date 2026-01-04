import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MallProductEntity, ArticleEntity } from '@app/db';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(MallProductEntity)
        private readonly productRepo: Repository<MallProductEntity>,
        @InjectRepository(ArticleEntity)
        private readonly articleRepo: Repository<ArticleEntity>
    ) {}

    async search(dto: SearchDto) {
        const { keyword, page, limit } = dto;
        const skip = (page - 1) * limit;

        const [products, productCount] = await this.productRepo.findAndCount({
            where: [
                { name: Like(`%${keyword}%`) },
                { description: Like(`%${keyword}%`) },
            ],
            skip,
            take: limit,
        });

        const [articles, articleCount] = await this.articleRepo.findAndCount({
            where: [
                { title: Like(`%${keyword}%`) },
                { content: Like(`%${keyword}%`) },
            ],
            skip,
            take: limit,
        });

        return {
            products: {
                items: products,
                total: productCount,
            },
            articles: {
                items: articles,
                total: articleCount,
            },
        };
    }
}
