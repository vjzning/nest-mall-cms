import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from './auth.service';
import { SystemConfigService } from '@app/shared/system-config/system-config.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: SystemConfigService
    ) {
        // 使用 dummy 值初始化，因为构造函数执行时 SystemConfigService 可能还没加载完数据库配置
        super({
            clientID: 'placeholder',
            clientSecret: 'placeholder',
            callbackURL: 'placeholder',
            scope: ['user:email'],
        });
    }

    /**
     * 重写 authenticate 方法以在运行时动态设置配置
     */
    authenticate(req: any, options: any) {
        try {
            const clientID =
                this.configService.get('github.client_id') ||
                process.env.GITHUB_CLIENT_ID;
            const clientSecret =
                this.configService.get('github.client_secret') ||
                process.env.GITHUB_CLIENT_SECRET;
            const callbackURL =
                this.configService.get('github.callback_url') ||
                process.env.GITHUB_CALLBACK_URL;

            console.log('Updating GithubStrategy config:', {
                clientID,
                callbackURL,
                hasSecret: !!clientSecret,
            });

            // GitHub 策略基于 OAuth2Strategy，其内部使用 _oauth2 对象
            // 我们需要更新 _oauth2 实例中的客户端 ID 和密钥
            if ((this as any)._oauth2) {
                (this as any)._oauth2._clientId = clientID;
                (this as any)._oauth2._clientSecret = clientSecret;
            }
            (this as any)._callbackURL = callbackURL;
        } catch (err) {
            console.error(
                'Failed to update GithubStrategy config dynamically:',
                err
            );
        }

        super.authenticate(req, options);
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: Function
    ) {
        const { id, username, displayName, photos, emails } = profile;

        const userProfile = {
            id: id,
            nickname: displayName || username,
            avatar: photos?.[0]?.value,
            email: emails?.[0]?.value,
        };

        const result = await this.authService.oauthLogin('github', userProfile);
        done(null, result);
    }
}
