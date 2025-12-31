import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallShippingTemplateEntity, MallShippingRuleEntity, MallShippingFreeRuleEntity, RegionEntity } from '@app/db';
import { ShippingTemplateController } from './shipping-template.controller';
import { ShippingTemplateService } from './shipping-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MallShippingTemplateEntity,
      MallShippingRuleEntity,
      MallShippingFreeRuleEntity,
      RegionEntity,
    ]),
  ],
  controllers: [ShippingTemplateController],
  providers: [ShippingTemplateService],
  exports: [ShippingTemplateService],
})
export class ShippingTemplateModule {}
