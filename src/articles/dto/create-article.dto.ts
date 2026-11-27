import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer';
import { ValidationErrorMessage } from '../../common/validation.enum.js';

class CreateArticle {
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    title: string;

    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    description: string;

    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
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
