import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [AddressModule, FavoriteModule],
  exports: [AddressModule, FavoriteModule],
})
export class MemberModule {}
