import { NestFactory } from '@nestjs/core';
import { SemActivityApiModule } from './sem-activity-api.module';

async function bootstrap() {
  const app = await NestFactory.create(SemActivityApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
