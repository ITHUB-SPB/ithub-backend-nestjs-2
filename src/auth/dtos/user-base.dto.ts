import { ValidateNested } from 'class-validator'
import { Expose, Exclude, Type } from 'class-transformer'

export class UserResult {
    @Exclude()
    id: string;

    username: string;

    @Exclude()
    password: string;

    email: string;

    bio: string | null;
    image: string | null;
    token: string;

    constructor(data: Partial<UserResult>) {
        Object.assign(this, data)
    }
}

export class UserResponseDto {
    @Type(() => UserResult)
    user: UserResult

    constructor(data: UserResult) {
        this.user = data
    }
}