import { NestFactory } from '@nestjs/core';
import { CmsContentApiModule } from './cms-content-api.module';

async function bootstrap() {
  const app = await NestFactory.create(CmsContentApiModule);
  await app.listen(process.env.CONTENT_API_PORT ?? 3001);
}
bootstrap();
