import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateArticle {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagList?: string[];
}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticle)
  article: CreateArticle;
}
