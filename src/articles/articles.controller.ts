import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { AuthService } from '../auth/auth.service.js';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService
  ) { }

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
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
