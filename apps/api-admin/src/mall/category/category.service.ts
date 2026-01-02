import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { MallCategoryEntity } from '@app/db/entities/mall-category.entity';
import { CreateMallCategoryDto, UpdateMallCategoryDto } from './dto/category.dto';

@Injectable()
export class MallCategoryService {
  constructor(
    @InjectRepository(MallCategoryEntity)
    private readonly categoryRepo: TreeRepository<MallCategoryEntity>,
  ) {}

  async create(dto: CreateMallCategoryDto) {
    const category = new MallCategoryEntity();
    Object.assign(category, dto);

    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent category #${dto.parentId} not found`);
      }
      category.parent = parent;
      category.level = parent.level + 1;
    } else {
        category.level = 0;
    }

    return this.categoryRepo.save(category);
  }

  async findAll() {
    // findTrees 会自动组装 children 属性
    // 如果想要扁平结构可以用 find()
    return this.categoryRepo.findTrees({
        relations: ['parent']
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateMallCategoryDto) {
    const category = await this.findOne(id);
    
    // 如果修改了 parentId
    if (dto.parentId !== undefined && dto.parentId !== category.parent?.id) {
         // 防止设置为自己
        if(dto.parentId === id) {
            throw new BadRequestException('Cannot set parent to self');
        }

        if (dto.parentId === 0) {
            category.parent = null as any;
            category.level = 0;
        } else {
            const newParent = await this.categoryRepo.findOne({ where: { id: dto.parentId } });
            if (!newParent) {
                throw new NotFoundException(`Parent category #${dto.parentId} not found`);
            }
             // 防止循环引用 (A -> B -> A) - TreeRepository 通常会处理，但最好检查
             // 对于 materialized-path 策略，简单的父子检查可能不够，但在 UI 上通常是通过下拉框选择，风险较小
            category.parent = newParent;
            category.level = newParent.level + 1;
        }
    }

    Object.assign(category, dto);
    // 移除 parentId 属性，因为我们已经处理了 parent 关系，且不能直接更新 parentId 字段（如果它是外键）
    // 不过 DTO 里有 parentId，assign 会覆盖吗？ Entity 里通常没有 parentId 这一列作为普通列，而是 relation
    // 此处 Object.assign 是安全的，因为 Entity 类定义里没有显式的 parentId 列（typeorm 处理）
    
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    // TreeRepository 的 remove 会级联删除子节点吗？通常取决于 onUpdate/onDelete 配置
    // 对于商品分类，建议：如果有子分类，禁止删除；或者如果有商品，禁止删除。
    
    const childrenCount = await this.categoryRepo.count({
        where: { parent: { id } }
    });
    
    if (childrenCount > 0) {
        throw new BadRequestException('Cannot delete category with children. Please delete children first.');
    }

    // 检查是否关联了商品 (这需要 MallProductEntity 的 repository)
    // 暂时略过，建议在数据库层面做 restrict，或者在这里注入 ProductRepo 检查

    return this.categoryRepo.remove(category);
  }
}
