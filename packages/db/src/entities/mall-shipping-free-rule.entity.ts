import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { MallShippingTemplateEntity } from './mall-shipping-template.entity';

@Entity('mall_shipping_free_rule')
export class MallShippingFreeRuleEntity extends BaseEntity {
  @Column({ name: 'template_id', type: 'bigint' })
  templateId: number;

  @ManyToOne('MallShippingTemplateEntity', (template: MallShippingTemplateEntity) => template.freeRules)
  @JoinColumn({ name: 'template_id' })
  template: MallShippingTemplateEntity;

  @Column({ name: 'region_ids', type: 'json', nullable: true, comment: '适用地区 ID 列表' })
  regionIds: string[];

  @Column({ name: 'cond_type', type: 'tinyint', comment: '包邮条件 (1: 满金额, 2: 满件数, 3: 满金额+满件数)' })
  condType: number;

  @Column({ name: 'full_amount', type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '满额金额' })
  fullAmount: number;

  @Column({ name: 'full_quantity', type: 'int', nullable: true, comment: '满件数量' })
  fullQuantity: number;
}
