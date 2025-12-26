import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(MallProductEntity)
    private readonly productRepo: Repository<MallProductEntity>,
  ) { }

  async findAll() {
    const products = await this.productRepo.find({
      where: { status: 1 }, // Only on-shelf products
      order: { sort: 'DESC', createdAt: 'DESC' },
      relations: ['skus'],
    });

    return products.map(p => {
      const price = p.skus?.length > 0
        ? Math.min(...p.skus.map(s => s.price))
        : 0;
      return {
        ...p,
        price,
      };
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id, status: 1 },
      relations: ['skus'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    const price = product.skus?.length > 0
      ? Math.min(...product.skus.map(s => s.price))
      : 0;

    return {
      ...product,
      price,
    };
  }
}
