import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { CmsContentApiModule } from './cms-content-api.module';
import passport from 'passport';
import { TransformInterceptor } from '@app/shared/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@app/shared/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(CmsContentApiModule);

    // 全局数据验证
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );

    // 全局响应拦截器
    app.useGlobalInterceptors(new TransformInterceptor());

    // 全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 启用跨域
    app.enableCors();

    // 初始化 Passport 中间件
    app.use(passport.initialize());

    await app.listen(process.env.CONTENT_API_PORT ?? 3001);
}
bootstrap();
