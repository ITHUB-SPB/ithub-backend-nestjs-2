import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional } from 'class-validator'
import { ValidationErrorMessage } from '../../common/validation.enum.js';

export class UserCreateDto {
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // проверка на одно слово
    username: string;

    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // @IsStrongPassword({ message: ValidationErrorMessage.INVALID })
    password: string;

    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // @IsEmail({ message: ValidationErrorMessage.INVALID })
    email: string;
}

export class UserCreateResultDto {
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
    token: string;
}