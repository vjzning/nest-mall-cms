import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { MallShippingTemplateEntity, MallShippingRuleEntity, MallShippingFreeRuleEntity, RegionEntity } from '@app/db';
import { CreateShippingTemplateDto } from './dto/create-shipping-template.dto';
import { UpdateShippingTemplateDto } from './dto/update-shipping-template.dto';

@Injectable()
export class ShippingTemplateService {
  constructor(
    @InjectRepository(MallShippingTemplateEntity)
    private readonly templateRepo: Repository<MallShippingTemplateEntity>,
    @InjectRepository(RegionEntity)
    private readonly regionRepo: Repository<RegionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 分页查询运费模板
   */
  async findAll(query: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = query;
    const [items, total] = await this.templateRepo.findAndCount({
      relations: ['rules', 'freeRules'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    // 填充地区名称
    for (const item of items) {
      await this.fillRegionNames(item);
    }

    return { items, total };
  }

  /**
   * 获取单个运费模板详情
   */
  async findOne(id: number) {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['rules', 'freeRules'],
    });
    if (!template) {
      throw new NotFoundException('运费模板不存在');
    }

    await this.fillRegionNames(template);
    return template;
  }

  /**
   * 填充规则中的地区名称
   */
  private async fillRegionNames(template: MallShippingTemplateEntity) {
    const allRegionIds = new Set<string>();
    template.rules?.forEach(r => r.regionIds?.forEach(id => allRegionIds.add(id)));
    template.freeRules?.forEach(r => r.regionIds?.forEach(id => allRegionIds.add(id)));

    if (allRegionIds.size > 0) {
      const regions = await this.regionRepo.find({
        where: { code: In([...allRegionIds]) },
        select: ['code', 'name'],
      });
      const regionMap = new Map(regions.map(r => [r.code, r.name]));

      template.rules?.forEach(r => {
        (r as any).regionNames = r.regionIds?.map(id => regionMap.get(id) || id);
      });
      template.freeRules?.forEach(r => {
        (r as any).regionNames = r.regionIds?.map(id => regionMap.get(id) || id);
      });
    }
  }

  /**
   * 创建运费模板
   */
  async create(dto: CreateShippingTemplateDto) {
    return await this.dataSource.transaction(async (manager) => {
      // 如果设置为默认，取消其他默认模板
      if (dto.isDefault) {
        await manager.update(MallShippingTemplateEntity, { isDefault: true }, { isDefault: false });
      }

      const template = manager.create(MallShippingTemplateEntity, dto);
      return await manager.save(template);
    });
  }

  /**
   * 更新运费模板
   */
  async update(id: number, dto: UpdateShippingTemplateDto) {
    const template = await this.findOne(id);
    
    return await this.dataSource.transaction(async (manager) => {
      if (dto.isDefault) {
        // 取消其他默认，排除当前 ID
        await manager.createQueryBuilder()
          .update(MallShippingTemplateEntity)
          .set({ isDefault: false })
          .where('id != :id', { id })
          .andWhere('isDefault = :isDefault', { isDefault: true })
          .execute();
      }

      // 处理规则更新：先删除旧的，再通过 cascade 保存新的
      if (dto.rules) {
        await manager.delete(MallShippingRuleEntity, { templateId: id });
        template.rules = []; // 清空当前实体的 rules，防止 merge 时冲突
      }
      if (dto.freeRules) {
        await manager.delete(MallShippingFreeRuleEntity, { templateId: id });
        template.freeRules = []; // 清空当前实体的 freeRules
      }

      const updatedTemplate = manager.merge(MallShippingTemplateEntity, template, dto);
      return await manager.save(updatedTemplate);
    });
  }

  /**
   * 删除运费模板
   */
  async remove(id: number) {
    const template = await this.findOne(id);
    if (template.isDefault) {
      throw new BadRequestException('默认模板不能删除');
    }
    return await this.templateRepo.remove(template);
  }
}
