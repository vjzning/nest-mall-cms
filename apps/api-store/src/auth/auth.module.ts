import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SystemConfigModule } from '@app/shared/system-config/system-config.module';
import { MemberEntity, MemberAuthEntity } from '@app/db';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './github.strategy';
import { WechatStrategy } from './wechat.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([MemberEntity, MemberAuthEntity]),
        PassportModule,
        SystemConfigModule,
        JwtModule.register({
            secret:
                process.env.JWT_SECRET ||
                'your-secret-key-change-in-production',
            signOptions: { expiresIn: '7d' }, // Token expires in 7 days
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GithubStrategy, WechatStrategy],
    exports: [AuthService],
})
export class AuthModule {}
