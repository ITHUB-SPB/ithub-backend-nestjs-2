import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateArticleDto } from './dto/create-article.dto.js';

import { Article } from './entities/article.entity.js';
import { AuthService } from '../auth/auth.service.js';
import { errorResponse } from '../common/validation.enum.js';


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

    const article = createArticleDtoWithUser.article
    const newArticle = this.articleRepository.create({
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList ?? [],
      slug: await this.createUniqueSlug(article.title),
      createdAt: new Date(),
      author,
    })

    return await this.articleRepository.save(newArticle)
  }

  private async createUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'article'

    let slug = baseSlug
    let suffix = 2
    while (await this.articleRepository.exists({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }
    return slug
  }

  async findOne(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true },
    })
    if (!article) {
      throw new NotFoundException(errorResponse('article', 'not found'))
    }
    return article
  }

  async remove(slug: string, userEmail: string): Promise<void> {
    const article = await this.findOne(slug)
    if (article.author.email !== userEmail) {
      throw new ForbiddenException(errorResponse('article', 'forbidden'))
    }
    await this.articleRepository.remove(article)
  }
}
