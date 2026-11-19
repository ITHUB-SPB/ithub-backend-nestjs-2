import { IsString, IsNotEmpty, ValidateNested } from 'class-validator'

class CreateArticle {
    @IsString({ message: 'Обязательное поле' })
    @IsNotEmpty({ message: 'Название не может быть пустым' })
    title: string;
}

export class CreateArticleDto {
    @ValidateNested()
    article: CreateArticle;
}