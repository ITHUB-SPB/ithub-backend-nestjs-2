import { Controller, Get, Post, Body, Param, Delete, Headers, ForbiddenException, HttpException, ConflictException } from '@nestjs/common';
import AuthToken from '../common/auth-token.decorator.js';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { ArticleResponseDto } from './dto/article.dto.js';

import { AuthService } from '../auth/auth.service.js';

@Controller('api/articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService
  ) { }


  @ApiBearerAuth('JWT')
  @Post()
  async create(
    @AuthToken() authorizationToken: string,
    @Body() createArticleDto: CreateArticleDto
  ) {
    const user = await this.authService.getUserByToken(authorizationToken)

    if (!user) {
      throw new ForbiddenException()
    }

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
