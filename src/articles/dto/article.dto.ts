    import { Expose, Type, Transform } from 'class-transformer'
import { ValidateNested } from 'class-validator';
import { ProfileResult } from '../../auth/dtos/profile.dto.js';

export class ArticleResult {
    @Expose()
    description: string;

    @Expose()
    body: string;

    @Expose()
    tagList: string[];

    @Expose()
    title: string;

    @Expose()
    slug: string;

    @Expose()
    @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
    createdAt: Date;

    @Expose()
    @ValidateNested()
    @Type(() => ProfileResult)
    author: ProfileResult;

    constructor(data: Partial<ArticleResult>) {
        Object.assign(this, data)
        if (data.author) {
            this.author = new ProfileResult(data.author)
        }
    }
}

export class ArticleResponseDto {
    @Expose()
    @ValidateNested()
    @Type(() => ArticleResult)
    article: ArticleResult

    constructor(data: ArticleResult) {
        this.article = new ArticleResult(data)
    }
}
