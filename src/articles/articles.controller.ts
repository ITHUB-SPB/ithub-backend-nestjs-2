import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  ForbiddenException,
  HttpException,
  ConflictException,
  SerializeOptions,
  UnauthorizedException,
} from "@nestjs/common";
import AuthToken from "../common/auth-token.decorator.js";
import { ApiBearerAuth, ApiSecurity } from "@nestjs/swagger";

import { ArticlesService } from "./articles.service.js";
import { CreateArticleDto } from "./dto/create-article.dto.js";
import { ArticleResponseDto } from "./dto/article.dto.js";

import { AuthService } from "../auth/auth.service.js";

@Controller("api/articles")
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth("JWT")
  @Post()
  @SerializeOptions({ type: ArticleResponseDto })
  async create(
    @AuthToken() authorizationToken: string,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    const user = await this.authService.getUserByToken(authorizationToken);

    if (!user) {
      throw new UnauthorizedException({ errors: { token: ["is missing"] } });
    }

    const createdArticle = await this.articlesService.create(
      createArticleDto,
      user.email,
    );

    if (!createdArticle) {
      throw new ConflictException();
    }

    return { article: createdArticle };
  }

  @Get(":slug")
  @SerializeOptions({ type: ArticleResponseDto })
  async findOne(@Param("slug") slug: string) {
    const article = await this.articlesService.findOne(slug);
    return { article };
  }

  @Delete(":slug")
  async remove(
    @Param("slug") slug: string,
    @AuthToken() authorizationToken: string,
  ) {
    const user = await this.authService.getUserByToken(authorizationToken);

    if (!user) {
      throw new UnauthorizedException({ errors: { token: ["is missing"] } });
    }

    await this.articlesService.remove(slug, user.email);

    return { message: "article deleted" };
  }
}
