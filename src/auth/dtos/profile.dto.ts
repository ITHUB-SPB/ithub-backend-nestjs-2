import { Exclude, Type } from 'class-transformer'

export class ProfileResult {
    @Exclude()
    id: string;

    username: string;

    @Exclude()
    password: string;

    @Exclude()
    email: string;

    bio: string | null;

    image: string | null;

    constructor(data: Partial<ProfileResult>) {
        Object.assign(this, data)
    }
}

// export class UserResponseDto {
//     @Type(() => UserResult)
//     user: UserResult

//     constructor(data: UserResult) {
//         this.user = data
//     }
// }