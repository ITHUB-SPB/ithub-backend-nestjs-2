import { Controller, Get, Post, Body, Param, Delete, Headers, ForbiddenException, HttpException, ConflictException } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { ArticleResponseDto } from './dto/article.dto.js';

import { AuthService } from '../auth/auth.service.js';
import { User } from '../auth/entities/user.entity.js';

@Controller('api/articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService
  ) { }


  @ApiBearerAuth('JWT')
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createArticleDto: CreateArticleDto
  ) {
    const createdArticle = await this.articlesService.create({
      ...createArticleDto,
      userEmail: user.email
    });

    if (!createdArticle) {
      throw new ConflictException()
    }

    return new ArticleResponseDto({
      ...createdArticle,
      author: { ...createdArticle.author }
    })
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findOne(slug);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.articlesService.remove(slug);
  }
}
