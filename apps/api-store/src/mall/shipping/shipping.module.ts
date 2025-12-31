import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallShippingTemplateEntity, MallShippingRuleEntity, MallShippingFreeRuleEntity, MallProductEntity } from '@app/db';
import { ShippingService } from './shipping.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MallShippingTemplateEntity,
      MallShippingRuleEntity,
      MallShippingFreeRuleEntity,
      MallProductEntity,
    ]),
  ],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
