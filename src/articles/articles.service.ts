import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';

import { Article } from './entities/article.entity.js';
import { AuthService } from '../auth/auth.service.js';


@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    private readonly authService: AuthService
  ) { }

  async create(createArticleDtoWithUser: CreateArticleDto & { userEmail: string }) {
    console.log(createArticleDtoWithUser)

    const author = await this.authService
      .getUserByEmail(createArticleDtoWithUser.userEmail)

    if (!author) {
      return null
    }

    return await this.articleRepository.save({
      title: createArticleDtoWithUser.article.title,
      author
    })
  }

  findAll() {
    return `This action returns all articles`;
  }

  findOne(slug: string) {
    return `This action returns a #${slug} article`;
  }

  update(slug: string, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${slug} article`;
  }

  remove(slug: string) {
    return `This action removes a #${slug} article`;
  }
}
