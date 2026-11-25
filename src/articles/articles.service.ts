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
      description: createArticleDtoWithUser.article.description,
      body: createArticleDtoWithUser.article.body,
      tagList: createArticleDtoWithUser.article.tagList ?? [],
      author,
    });


    return await this.articleRepository.save(newArticle)
  }

  
  async findOne(slug: string): Promise<Article | null> {
    return await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true },
    });
  }


  async remove(slug: string): Promise<boolean> {
    const result = await this.articleRepository.delete({
      slug,
    });

    return (result.affected ?? 0) > 0;
  }
}