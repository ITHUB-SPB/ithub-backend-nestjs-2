import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module.js';

import { ArticlesService } from './articles.service.js';
import { ArticlesController } from './articles.controller.js';
import { Article } from './entities/article.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    AuthModule
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
