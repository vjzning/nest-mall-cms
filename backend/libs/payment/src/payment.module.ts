import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigEntity])],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
