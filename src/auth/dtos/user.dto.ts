import { ValidateNested } from 'class-validator'
import { Expose, Type } from 'class-transformer'

export class UserResult {
    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    bio: string | null;

    @Expose()
    image: string | null;

    @Expose()
    token: string;

    constructor(data: UserResult) {
        Object.assign(this, data)
    }
}

export class UserResponseDto {
    @ValidateNested()
    @Expose()
    @Type(() => UserResult)
    user: UserResult

    constructor(data: UserResult) {
        this.user = new UserResult(data)
    }
}
