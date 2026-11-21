import { IsString, IsNotEmpty, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer';

class CreateArticle {
    @IsString({ message: 'Обязательное поле' })
    @IsNotEmpty({ message: 'Название не может быть пустым' })
    title: string;
}

export class CreateArticleDto {
    @ValidateNested()
    @Type(() => CreateArticle)
    article: CreateArticle;
}