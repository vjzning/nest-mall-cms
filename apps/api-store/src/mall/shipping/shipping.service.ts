import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  MallShippingTemplateEntity,
  MallShippingRuleEntity,
  MallShippingFreeRuleEntity,
  MallProductEntity,
} from '@app/db';
import { Decimal } from 'decimal.js';

export interface ShippingItem {
  productId: number;
  quantity: number;
  price: number;
}

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(MallShippingTemplateEntity)
    private readonly templateRepo: Repository<MallShippingTemplateEntity>,
    @InjectRepository(MallProductEntity)
    private readonly productRepo: Repository<MallProductEntity>,
  ) {}

  /**
   * 计算运费
   * @param items 订单商品项
   * @param regionId 地区 ID (如省份 ID)
   */
  async calculateShippingFee(items: ShippingItem[], regionId: string): Promise<number> {
    if (!items || items.length === 0) return 0;

    // 1. 获取商品关联的运费模板信息
    const productIds = items.map((i) => i.productId);
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
      select: ['id', 'shippingTemplateId', 'weight', 'volume'],
    });

    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    // 2. 按模板分组
    const templateGroups = new Map<number | null, { items: ShippingItem[]; templateId: number | null }>();

    // 获取默认模板 ID
    const defaultTemplate = await this.templateRepo.findOne({ where: { isDefault: true } });
    const defaultTemplateId = defaultTemplate ? Number(defaultTemplate.id) : null;

    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      const tid = product?.shippingTemplateId ? Number(product.shippingTemplateId) : defaultTemplateId;
      if (!templateGroups.has(tid)) {
        templateGroups.set(tid, { items: [], templateId: tid });
      }
      templateGroups.get(tid)!.items.push(item);
    }

    // 3. 计算每个模板组的运费
    const groupFees: { firstFee: Decimal; extraFee: Decimal; totalFee: Decimal }[] = [];

    for (const group of templateGroups.values()) {
      if (!group.templateId) {
        groupFees.push({
          firstFee: new Decimal(0),
          extraFee: new Decimal(0),
          totalFee: new Decimal(0),
        });
        continue;
      }

      const template = await this.templateRepo.findOne({
        where: { id: group.templateId },
        relations: ['rules', 'freeRules'],
      });

      if (!template) {
        groupFees.push({
          firstFee: new Decimal(0),
          extraFee: new Decimal(0),
          totalFee: new Decimal(0),
        });
        continue;
      }

      // 匹配规则
      const rule = this.matchRule(template.rules, regionId);
      if (!rule) {
        groupFees.push({
          firstFee: new Decimal(0),
          extraFee: new Decimal(0),
          totalFee: new Decimal(0),
        });
        continue;
      }

      // 计算该组的总数量 (件数/重量/体积)
      let totalValue = new Decimal(0);
      let totalAmount = new Decimal(0);
      let totalQuantity = 0;

      for (const item of group.items) {
        const product = productMap.get(Number(item.productId));
        totalAmount = totalAmount.plus(new Decimal(item.price).times(item.quantity));
        totalQuantity += item.quantity;

        if (template.chargeType === 1) {
          // 按件数
          totalValue = totalValue.plus(item.quantity);
        } else if (template.chargeType === 2) {
          // 按重量
          totalValue = totalValue.plus(new Decimal(product?.weight || 0).times(item.quantity));
        } else if (template.chargeType === 3) {
          // 按体积
          totalValue = totalValue.plus(new Decimal(product?.volume || 0).times(item.quantity));
        }
      }

      // 检查包邮规则
      const isFree = this.checkFree(template.freeRules, regionId, totalAmount, totalQuantity);
      if (isFree) {
        groupFees.push({
          firstFee: new Decimal(0),
          extraFee: new Decimal(0),
          totalFee: new Decimal(0),
        });
        continue;
      }

      // 计算运费: 运费 = 首费 + ceil((总数量 - 首数量) / 续数量) * 续费
      const firstAmount = new Decimal(rule.firstAmount);
      const firstFee = new Decimal(rule.firstFee);
      const extraAmount = new Decimal(rule.extraAmount);
      const extraFee = new Decimal(rule.extraFee);

      let fee = firstFee;
      if (totalValue.gt(firstAmount) && extraAmount.gt(0)) {
        const extraValue = totalValue.minus(firstAmount);
        const extraCount = extraValue.div(extraAmount).ceil();
        fee = fee.plus(extraCount.times(extraFee));
      }

      groupFees.push({
        firstFee,
        extraFee: fee.minus(firstFee),
        totalFee: fee,
      });
    }

    // 4. 多模板叠加逻辑: 取所有分组中“首费”最高的模板作为基础，其余模板按“续费”逻辑累加
    if (groupFees.length === 0) return 0;

    let maxFirstFee = new Decimal(0);
    let totalExtraFee = new Decimal(0);

    for (const g of groupFees) {
      if (g.firstFee.gt(maxFirstFee)) {
        maxFirstFee = g.firstFee;
      }
      totalExtraFee = totalExtraFee.plus(g.extraFee);
    }

    return maxFirstFee.plus(totalExtraFee).toNumber();
  }

  private matchRule(rules: MallShippingRuleEntity[], regionId: string): MallShippingRuleEntity | null {
    // 优先匹配指定地区
    const regionRule = rules.find((r) => r.regionIds && r.regionIds.includes(regionId));
    if (regionRule) return regionRule;

    // 找不到匹配全国默认 (regionIds 为空)
    return rules.find((r) => !r.regionIds || r.regionIds.length === 0) || null;
  }

  private checkFree(
    freeRules: MallShippingFreeRuleEntity[],
    regionId: string,
    totalAmount: Decimal,
    totalQuantity: number,
  ): boolean {
    if (!freeRules || freeRules.length === 0) return false;

    // 匹配地区的包邮规则
    const rule = freeRules.find((r) => r.regionIds && r.regionIds.includes(regionId));
    if (!rule) {
      // 如果没有指定地区的包邮规则，看看有没有通用的 (regionIds 为空)
      const commonRule = freeRules.find((r) => !r.regionIds || r.regionIds.length === 0);
      if (!commonRule) return false;
      return this.isMeetFreeCond(commonRule, totalAmount, totalQuantity);
    }

    return this.isMeetFreeCond(rule, totalAmount, totalQuantity);
  }

  private isMeetFreeCond(rule: MallShippingFreeRuleEntity, totalAmount: Decimal, totalQuantity: number): boolean {
    if (rule.condType === 1) {
      // 满金额
      return totalAmount.gte(rule.fullAmount || 0);
    } else if (rule.condType === 2) {
      // 满件数
      return totalQuantity >= (rule.fullQuantity || 0);
    } else if (rule.condType === 3) {
      // 满金额 + 满件数
      return totalAmount.gte(rule.fullAmount || 0) && totalQuantity >= (rule.fullQuantity || 0);
    }
    return false;
  }
}
