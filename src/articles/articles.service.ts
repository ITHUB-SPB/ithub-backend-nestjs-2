import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateArticleDto } from "./dto/create-article.dto.js";

import { Article } from "./entities/article.entity.js";
import { AuthService } from "../auth/auth.service.js";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateArticleDto, userEmail: string): Promise<Article> {
    const author = await this.authService.getUserByEmail(userEmail);
    if (!author) throw new ForbiddenException();

    const newArticle = this.articleRepository.create({
      title: dto.article.title,
      description: dto.article.description,
      body: dto.article.body,
      tagList: dto.article.tagList || [],
      author,
    });

    return await this.articleRepository.save(newArticle);
  }

  async findOne(slug: string) {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true },
    });

    if (!article) {
      throw new NotFoundException("not found");
    }

    return article;
  }

  async remove(slug: string,userEmail: string):Promise<void>  {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: { author: true },
    });

    if (!article) {
      throw new NotFoundException("not found");
    }

    if (article.author.email !== userEmail) {
      throw new ForbiddenException('can delete only your own articles');
    }

    await this.articleRepository.remove(article);
  }
}
