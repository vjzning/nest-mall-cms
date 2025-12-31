import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { MallShippingTemplateEntity } from './mall-shipping-template.entity';

@Entity('mall_shipping_rule')
export class MallShippingRuleEntity extends BaseEntity {
  @Column({ name: 'template_id', type: 'bigint' })
  templateId: number;

  @ManyToOne('MallShippingTemplateEntity', (template: MallShippingTemplateEntity) => template.rules)
  @JoinColumn({ name: 'template_id' })
  template: MallShippingTemplateEntity;

  @Column({ name: 'region_ids', type: 'json', nullable: true, comment: '适用地区 ID 列表，空表示全国默认' })
  regionIds: string[];

  @Column({ name: 'first_amount', type: 'decimal', precision: 10, scale: 2, comment: '首重/首件/首体积数量' })
  firstAmount: number;

  @Column({ name: 'first_fee', type: 'decimal', precision: 10, scale: 2, comment: '首费金额' })
  firstFee: number;

  @Column({ name: 'extra_amount', type: 'decimal', precision: 10, scale: 2, comment: '续重/续件/续体积数量' })
  extraAmount: number;

  @Column({ name: 'extra_fee', type: 'decimal', precision: 10, scale: 2, comment: '续费金额' })
  extraFee: number;
}
