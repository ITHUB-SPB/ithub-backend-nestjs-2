import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';

import { ArticlesService } from './articles.service.js';
import { ArticlesController } from './articles.controller.js';
import { Article } from './entities/article.entity.js';
import { TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AuthModule
  ],
  controllers: [ArticlesController, TagsController],
  providers: [ArticlesService, TagsService],
})
export class ArticlesModule {}
