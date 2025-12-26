import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-wechat';
import { AuthService } from './auth.service';
import { SystemConfigService } from '@app/shared/system-config/system-config.service';

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, 'wechat') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: SystemConfigService
    ) {
        // 使用 dummy 值初始化
        super({
            appID: 'placeholder',
            appSecret: 'placeholder',
            callbackURL: 'placeholder',
            scope: 'snsapi_login',
            state: 'STATE',
        });
    }

    /**
     * 重写 authenticate 方法以在运行时动态设置配置
     */
    authenticate(req: any, options: any) {
        try {
            const appID =
                this.configService.get('wechat.app_id') ||
                process.env.WECHAT_APP_ID;
            const appSecret =
                this.configService.get('wechat.app_secret') ||
                process.env.WECHAT_APP_SECRET;
            const callbackURL =
                this.configService.get('wechat.callback_url') ||
                process.env.WECHAT_CALLBACK_URL;

            console.log('Updating WechatStrategy config:', {
                appID,
                callbackURL,
                hasSecret: !!appSecret,
            });

            // passport-wechat 使用内部的 _oauth 对象来生成授权链接
            // _oauth 是 wechat-oauth 的实例，其属性名为 appid 和 appsecret
            if ((this as any)._oauth) {
                (this as any)._oauth.appid = appID;
                (this as any)._oauth.appsecret = appSecret;
            }
            // 同时也更新 options 对象
            if ((this as any)._options) {
                (this as any)._options.appID = appID;
                (this as any)._options.appSecret = appSecret;
            }
            (this as any)._callbackURL = callbackURL;
        } catch (err) {
            console.error(
                'Failed to update WechatStrategy config dynamically:',
                err
            );
        }

        super.authenticate(req, options);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        expires_in: number,
        done: Function
    ) {
        // WeChat profile contains openid, unionid, nickname, sex, province, city, country, headimgurl, privilege
        const userProfile = {
            id: profile.unionid || profile.openid, // Prefer unionid for cross-platform identification
            nickname: profile.nickname,
            avatar: profile.headimgurl,
            email: null, // WeChat doesn't provide email
            openid: profile.openid,
            unionid: profile.unionid,
        };

        const result = await this.authService.oauthLogin('wechat', userProfile);
        done(null, result);
    }
}
