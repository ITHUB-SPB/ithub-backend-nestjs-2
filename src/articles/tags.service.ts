import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity.js';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async findAll(): Promise<string[]> {
    const articles = await this.articleRepository.find({
      select: {
        tagList: true,
      },
    });

    const tags = articles.flatMap(
      (article) => article.tagList ?? [],
    );

    return [...new Set(tags)];
  }
}