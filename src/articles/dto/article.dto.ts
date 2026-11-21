import { Expose, Exclude, Type } from 'class-transformer'
import { ProfileResult } from '../../auth/dtos/profile.dto.js';
import { ValidateNested } from 'class-validator';

export class ArticleResult {
    @Expose()
    title: string;

    @Expose()
    @ValidateNested()
    @Type(() => ProfileResult)
    author: ProfileResult;
}

export class ArticleResponseDto {
    @Expose()
    @ValidateNested()
    @Type(() => ArticleResult)
    article: ArticleResult

    constructor(data: ArticleResult) {
        this.article = data
    }
}