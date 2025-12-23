import { INestApplicationContext, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SemApiModule } from './sem-api.module';
let cachedApp: INestApplicationContext;
async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(SemApiModule);
    app.useGlobalPipes(
      new ValidationPipe({
        // disableErrorMessages: false,
        transform: true,
      })
    );
    cachedApp = app;
    return app;
  } else {
    return cachedApp;
  }
}
export const index = async (event) => {
  const app = await bootstrap();
  return 1;
};
(async function () {
  await index('');
})();
