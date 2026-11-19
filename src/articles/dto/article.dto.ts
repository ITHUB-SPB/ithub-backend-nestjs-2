import { Expose, Exclude, Type } from 'class-transformer'
import { ProfileResult } from '../../auth/dtos/profile.dto.js';

export class ArticleResult {
    title: string;

    @Type(() => ProfileResult)
    author: ProfileResult;

    constructor(data: Partial<ArticleResult | ProfileResult>) {
        Object.assign(this, data)
    }
}

export class ArticleResponseDto {
    @Type(() => ArticleResult)
    article: ArticleResult

    constructor(data: ArticleResult | ProfileResult) {
        this.article = data
    }
}