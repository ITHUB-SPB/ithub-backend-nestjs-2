import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateArticleDto } from './dto/create-article.dto.js';

import { Article } from './entities/article.entity.js';
import { AuthService } from '../auth/auth.service.js';


@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    private readonly authService: AuthService
  ) { }

  async create(createArticleDtoWithUser: CreateArticleDto & { userEmail: string }): Promise<Article | null> {
    const author = await this.authService
      .getUserByEmail(createArticleDtoWithUser.userEmail)

    if (!author) {
      return null
    }

    const newArticle = this.articleRepository.create({
      title: createArticleDtoWithUser.article.title,
      author
    })

    return await this.articleRepository.save(newArticle)
  }

  findOne(slug: string) {
    return `This action returns a #${slug} article`;
  }

  remove(slug: string) {
    return `This action removes a #${slug} article`;
  }
}
