import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from '../cms-admin-api.module';
import { ProductService } from '../mall/product/product.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CmsAdminApiModule);
  
  try {
    const productService = app.get(ProductService);
    console.log('Starting to seed products...');
    const result = await productService.generateMockData(100);
    console.log(`Successfully seeded ${result.count} products.`);
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
