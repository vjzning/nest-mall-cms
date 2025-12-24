import { Module, OnModuleInit } from '@nestjs/common';
import { PassportModule, AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
// import { LocalStrategy } from './local.strategy';
import { jwtSecret } from '../../common/constants/const';
import { JwtStrategy } from './jwt.strategy';
import { Utils } from '../../common/utils/utils';
import { AuthService } from './auth.service';
import { AccountService } from '../admin/system/account/account.service';
import { SysModule } from '../admin/system/system.module';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    SysModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '2d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccountService, Utils, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
