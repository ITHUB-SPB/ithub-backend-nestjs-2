import { Expose, Exclude, Type, Transform } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ProfileResult } from "../../auth/dtos/profile.dto.js";

export class ArticleResult {
  @Expose()
  title: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  body: string;

  @Expose()
  tagList: string[];

  @Expose()
  @Type(() => String)
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose()
  @ValidateNested()
  @Type(() => ProfileResult)
  author: ProfileResult;
}

export class ArticleResponseDto {
  @Expose()
  @ValidateNested()
  @Type(() => ArticleResult)
  article: ArticleResult;

  constructor(data?: ArticleResult) {
    console.log(data);
    if (data) {
      this.article = data;
    }
  }
}
