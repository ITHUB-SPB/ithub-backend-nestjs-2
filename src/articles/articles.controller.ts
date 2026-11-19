import { Controller, Get, Post, Body, Put, Param, Delete, Headers, ForbiddenException, HttpException, ConflictException } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger'

import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { ArticleResponseDto } from './dto/article.dto.js';

import { AuthService } from '../auth/auth.service.js';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService
  ) { }


  @ApiBearerAuth()
  @Post()
  async create(@Headers('Authorization') authorizationHeader: string, @Body() createArticleDto: CreateArticleDto) {
    const user = await this.authService.getUserByToken(authorizationHeader)

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

    console.log(createdArticle)

    return new ArticleResponseDto(createdArticle)
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.articlesService.findOne(slug);
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(slug, updateArticleDto);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.articlesService.remove(slug);
  }

  @Get('/feed')
  feed() {
    return this.articlesService.findAll();
  }

  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

}
