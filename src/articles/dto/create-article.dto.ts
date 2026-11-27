import { IsString, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator'
import { Type } from 'class-transformer';

class CreateArticle {
    @IsString({ message: 'Обязательное поле' })
    @IsNotEmpty({ message: 'Название не может быть пустым' })
    title: string;

    @IsString({ message: 'Обязательное поле' })
    @IsNotEmpty({ message: 'описание не может быть пустым' })
    description: string;

    @IsString({ message: 'Обязательное поле' })
    @IsNotEmpty({ message: 'тело не может быть пустым' })
    body: string;

    @IsString({ message: 'Обязательное поле' })
    @IsOptional()
    tagList?: string[];
}

export class CreateArticleDto {
    @ValidateNested()
    @Type(() => CreateArticle)
    article: CreateArticle;
}