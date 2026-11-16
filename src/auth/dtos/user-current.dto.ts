import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional } from 'class-validator'
import { ValidationErrorMessage } from '../../common/validation.enum.js';

export class UserCurrentDto {
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
}

// jsonpath "$.user.username" == "auth_{{uid}}"
// jsonpath "$.user.email" == "auth_{{uid}}@test.com"
// jsonpath "$.user.bio" == null
// jsonpath "$.user.image" == null
// jsonpath "$.user.token" isString
// jsonpath "$.user.token" not isEmpty