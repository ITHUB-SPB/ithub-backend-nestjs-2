import { Exclude, Expose, Type } from 'class-transformer'

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