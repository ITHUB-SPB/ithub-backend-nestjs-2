import { ValidateNested } from 'class-validator'

class UserResult {
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
    token: string;
}

export class UserResponseDto {
    @ValidateNested()
    user: UserResult
}