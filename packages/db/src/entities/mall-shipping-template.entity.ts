import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallShippingRuleEntity } from './mall-shipping-rule.entity';
import { MallShippingFreeRuleEntity } from './mall-shipping-free-rule.entity';

@Entity('mall_shipping_template')
export class MallShippingTemplateEntity extends BaseEntity {
    @Column({ length: 100, comment: '模板名称' })
    name: string;

    @Column({
        name: 'charge_type',
        type: 'tinyint',
        comment: '计费方式 (1: 按件数, 2: 按重量, 3: 按体积)',
    })
    chargeType: number;

    @Column({
        name: 'is_default',
        type: 'boolean',
        default: false,
        comment: '是否为默认模板',
    })
    isDefault: boolean;

    @Column({ type: 'tinyint', default: 1, comment: '状态 (0: 禁用, 1: 启用)' })
    status: number;

    @OneToMany(() => MallShippingRuleEntity, (rule) => rule.template, {
        cascade: true,
    })
    rules: MallShippingRuleEntity[];

    @OneToMany(
        () => MallShippingFreeRuleEntity,
        (freeRule) => freeRule.template,
        {
            cascade: true,
        }
    )
    freeRules: MallShippingFreeRuleEntity[];
}
