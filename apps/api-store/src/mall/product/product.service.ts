import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(MallProductEntity)
    private readonly productRepo: Repository<MallProductEntity>,
  ) {}

  findAll() {
    return this.productRepo.find({
      where: { status: 1 }, // Only on-shelf products
      order: { sort: 'DESC', createdAt: 'DESC' },
      select: ['id', 'name', 'cover', 'sales', 'categoryId'],
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
    return product;
  }
}
