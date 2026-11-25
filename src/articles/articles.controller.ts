import { Controller, Get, Post, Body, Param, Delete, Headers, ForbiddenException, HttpException, ConflictException } from '@nestjs/common';
import AuthToken from '../common/auth-token.decorator.js';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { ArticleResponseDto } from './dto/article.dto.js';

import { AuthService } from '../auth/auth.service.js';

import { NotFoundException } from '@nestjs/common';

import { HttpCode, UnauthorizedException } from '@nestjs/common';

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
  async findOne(@Param('slug') slug: string) {
    const article = await this.articlesService.findOne(slug);

    if (!article) {
      throw new NotFoundException({
        errors: {
          article: ['not found'],
        },
      });
    }

  return new ArticleResponseDto({
    ...article,
    author: { ...article.author },
  });
}

@ApiBearerAuth('JWT')
@HttpCode(204)
@Delete(':slug')
async remove(
  @Param('slug') slug: string,
  @AuthToken() authorizationToken: string,
): Promise<void> {
  if (!authorizationToken) {
    throw new UnauthorizedException({
      errors: { token: ['is missing'] },
    });
  }

  const user = await this.authService.getUserByToken(authorizationToken);

  if (!user) {
    throw new UnauthorizedException({
      errors: { token: ['is invalid'] },
    });
  }

  const article = await this.articlesService.findOne(slug);

  if (!article) {
    throw new NotFoundException({
      errors: { article: ['not found'] },
    });
  }

  if (article.author.id !== user.id) {
    throw new ForbiddenException({
      errors: { article: ['forbidden'] },
    });
  }

  const deleted = await this.articlesService.remove(slug);

  if (!deleted) {
    throw new NotFoundException({
      errors: { article: ['not found'] },
    });
  }
}
}
