import { NestFactory } from '@nestjs/core';
import { CmsContentApiModule } from './cms-content-api.module';
import passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(CmsContentApiModule);

    // 初始化 Passport 中间件，解决某些第三方策略报 "passport.initialize() middleware not in use" 的问题
    app.use(passport.initialize());

    await app.listen(process.env.CONTENT_API_PORT ?? 3001);
}
bootstrap();
