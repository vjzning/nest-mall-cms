import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from '../cms-admin-api.module';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { faker } from '@faker-js/faker';
import { ArticleEntity } from '@app/db/entities/article.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CmsAdminApiModule);
  
  const articleRepository = app.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity));
  const userService = app.get(UserService);
  const categoryService = app.get(CategoryService);
  const tagService = app.get(TagService);

  console.log('Seeding 100 articles...');

  // Get Admin User
  const users = await userService.findAll();
  const author = users[0];
  if (!author) {
    console.error('No user found. Please seed users first.');
    await app.close();
    return;
  }

  // Get Categories and Tags
  const categories = await categoryService.findAll();
  const tags = await tagService.findAll();

  const articles: ArticleEntity[] = [];

  for (let i = 0; i < 100; i++) {
    const title = faker.lorem.sentence({ min: 3, max: 8 });
    const article = new ArticleEntity();
    article.title = title;
    article.slug = faker.helpers.slugify(title).toLowerCase() + '-' + faker.string.alphanumeric(6);
    article.description = faker.lorem.paragraph();
    article.content = faker.lorem.paragraphs(5, '\n\n');
    article.cover = faker.image.urlPicsumPhotos({ width: 800, height: 400 });
    article.status = faker.helpers.arrayElement([0, 1, 2]); // Draft, Published
    article.isRecommend = faker.number.int({ min: 0, max: 1 });
    article.isTop = faker.number.int({ min: 0, max: 1 });
    article.views = faker.number.int({ min: 0, max: 10000 });
    article.likes = faker.number.int({ min: 0, max: 1000 });
    article.createdAt = faker.date.past();
    article.author = author;
    
    if (categories.length > 0) {
      article.category = faker.helpers.arrayElement(categories);
    }

    if (tags.length > 0) {
        article.tags = faker.helpers.arrayElements(tags, { min: 0, max: 3 });
    }
    
    if (article.status === 2) {
        article.publishedAt = article.createdAt;
    }

    articles.push(article);
  }

  await articleRepository.save(articles);

  console.log('Seeding completed!');
  await app.close();
}

bootstrap();
