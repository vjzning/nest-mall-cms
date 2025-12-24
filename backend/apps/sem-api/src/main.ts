import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SemApiModule } from './sem-api.module';
import * as express from 'express';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(SemApiModule, {
    logger: new ConsoleLogger({
      colors: true,
      prefix: 'sem-api',
    })
  });
  app.disable('x-powered-by');
  const config = app.get(ConfigService);
  app.setGlobalPrefix('/api');
  app.use(express.static(path.resolve(__dirname, '..', '..', 'build')));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.json({ limit: '50mb' }));
  app.use((req, res, next) => {
    const reqPath: string = req.path;
    if (
      reqPath == '/' ||
      (!reqPath.startsWith('/api') && !reqPath.startsWith('/dapi'))
    ) {
      res.sendFile(path.resolve(__dirname, '..', '..', 'build', 'index.html'));
    } else {
      next();
    }
  });
  // const docConfig = new DocumentBuilder()
  //   .addBearerAuth()
  //   .addBasicAuth()
  //   .addSecurityRequirements('bearer')
  //   .setTitle('营销配置')
  //   .setDescription('营销配置接口描述')
  //   .setVersion('1.0')
  //   .build();
  // const document = SwaggerModule.createDocument(app, docConfig);
  // SwaggerModule.setup('dapi', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      // disableErrorMessages: false,
      transform: true,
    })
  );
  // 获取配置端口
  const port = config.get<number>('AppPort') || 8000;
  await app.listen(port);
  const appLocalPath = await app.getUrl();
  console.log(appLocalPath, '服务启动成功');
}
bootstrap();


console.log('Server  with fast mode ');


