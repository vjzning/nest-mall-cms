import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
