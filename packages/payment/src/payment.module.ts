import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SystemConfigModule } from '@app/shared/system-config/system-config.module';

@Module({
  imports: [SystemConfigModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
