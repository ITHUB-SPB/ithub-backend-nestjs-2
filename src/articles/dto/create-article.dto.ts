import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

class CreateArticle {
  @IsString({ message: "Обязательное поле" })
  @IsNotEmpty({ message: "can't be blank" })
  title: string;

  @IsString({ message: "Обязательное поле" })
  @IsNotEmpty({ message: "can't be blank" })
  description: string;

  @IsString({ message: "Обязательное поле" })
  @IsNotEmpty({ message: "can't be blank" })
  body: string;

  @IsArray()
  @IsOptional()
  tagList?: string[];
}

export class CreateArticleDto {
  @ValidateNested()
  @Type(() => CreateArticle)
  article: CreateArticle;
}
