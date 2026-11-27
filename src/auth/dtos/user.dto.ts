import { ValidateNested } from "class-validator";
import { Expose, Exclude, Type } from "class-transformer";

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

  constructor(data?: Partial<UserResult>) {
    if (data) {
      this.username = data.username!;
      this.email = data.email!;
      this.bio = data.bio ?? null;
      this.image = data.image ?? null;
      this.token = data.token!;
    }
  }
}

export class UserResponseDto {
  @Expose()
  user: UserResult;

  constructor(data?: Partial<UserResult>) {
    if (data) {
      this.user = new UserResult(data);
    }
  }
}
