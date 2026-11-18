import { ValidateNested } from 'class-validator'
import { Exclude, Type } from 'class-transformer'

class UserResult {
    @Exclude()
    id: string;

    username: string;

    @Exclude()
    password: string;

    email: string;
    bio: string | null;
    image: string | null;
    token: string;
}

export class UserResponseDto {
    @Type(() => UserResult)
    user: UserResult
}