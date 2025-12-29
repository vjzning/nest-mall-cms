import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from './cms-admin-api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// @ts-ignore
import metadata from './metadata';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(CmsAdminApiModule);

    app.use(cookieParser());
    app.use(passport.initialize());

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        })
    );

    await SwaggerModule.loadPluginMetadata(metadata);
    const config = new DocumentBuilder()
        .setTitle('CMS Admin API')
        .setDescription('The CMS Admin API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.ADMIN_API_PORT ?? 3000);
}
bootstrap();
