import { Expose, Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

export class ProfileResult {
    @Expose()
    username: string;

    @Expose()
    bio: string | null;

    @Expose()
    image: string | null;

    constructor(data: Partial<ProfileResult>) {
        Object.assign(this, data)
    }
}

export class ProfileResponseDto {
    @Expose()
    @ValidateNested()
    @Type(() => ProfileResult)
    profile: ProfileResult;

    constructor(data: Partial<ProfileResult>) {
        this.profile = new ProfileResult(data)
    }
}
