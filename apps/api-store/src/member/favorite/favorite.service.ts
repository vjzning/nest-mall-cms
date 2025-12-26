import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberFavoriteEntity, MallProductEntity } from '@app/db';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(MemberFavoriteEntity)
    private readonly favoriteRepo: Repository<MemberFavoriteEntity>,
    @InjectRepository(MallProductEntity)
    private readonly productRepo: Repository<MallProductEntity>,
  ) {}

  async toggleFavorite(memberId: number, productId: number) {
    console.log('toggleFavorite:', { memberId, productId });
    const existing = await this.favoriteRepo.findOne({
      where: { memberId, productId },
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { favorited: false };
    } else {
      const favorite = this.favoriteRepo.create({
        memberId,
        productId,
      });
      await this.favoriteRepo.save(favorite);
      return { favorited: true };
    }
  }

  async getFavorites(memberId: number, page: number = 1, limit: number = 10) {
    const [items, total] = await this.favoriteRepo.findAndCount({
      where: { memberId },
      relations: ['product', 'product.skus'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate min price for each product
    const favorites = items.map(item => {
      const product = item.product;
      const price = product?.skus?.length > 0 
        ? Math.min(...product.skus.map(s => s.price)) 
        : 0;
      return {
        ...item,
        product: {
          ...product,
          price,
        }
      };
    });

    return {
      items: favorites,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isFavorite(memberId: number, productId: number) {
    const count = await this.favoriteRepo.count({
      where: { memberId, productId },
    });
    return count > 0;
  }
}
