import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';

@Module({
  imports: [AddressModule],
  exports: [AddressModule],
})
export class MemberModule {}
