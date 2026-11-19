import { Expose, Exclude, Type } from 'class-transformer'
import { ProfileResult } from '../../auth/dtos/profile.dto.js';

export class ArticleResult {
    @Exclude()
    id: string;

    title: string;

    @Type(() => ProfileResult)
    author: ProfileResult;
}

export class ArticleResponseDto {
    @Type(() => ArticleResult)
    article: ArticleResult

    constructor(data: ArticleResult) {
        this.article = data
    }
}