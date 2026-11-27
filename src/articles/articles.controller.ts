import { Controller, Get, Post, Body, Param, Delete, HttpCode, UnauthorizedException } from '@nestjs/common';
import AuthToken from '../common/auth-token.decorator.js';
import { ApiBearerAuth } from '@nestjs/swagger'

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
      throw new UnauthorizedException({ errors: { token: ['is missing'] } })
    }

    const createdArticle = await this.articlesService.create({
      article: createArticleDto.article,
      userEmail: user.email
    });

    if (!createdArticle) {
      throw new UnauthorizedException({ errors: { token: ['is missing'] } })
    }

    return new ArticleResponseDto(this.toResponse(createdArticle))
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.articlesService.findOne(slug)
    return new ArticleResponseDto(this.toResponse(article))
  }

  @HttpCode(204)
  @Delete(':slug')
  async remove(@Param('slug') slug: string, @AuthToken() authorizationToken: string) {
    const user = await this.authService.getUserByToken(authorizationToken)
    if (!user) {
      throw new UnauthorizedException({ errors: { token: ['is missing'] } })
    }
    await this.articlesService.remove(slug, user.email)
  }

  private toResponse(article: Awaited<ReturnType<ArticlesService['findOne']>>) {
    return {
      title: article.title,
      slug: article.slug,
      description: article.description,
      body: article.body,
      tagList: article.tagList ?? [],
      createdAt: article.createdAt,
      author: {
        username: article.author.username,
        bio: article.author.bio ?? null,
        image: article.author.image === 'default-avatar.png' ? null : article.author.image ?? null,
      },
    }
  }
}
