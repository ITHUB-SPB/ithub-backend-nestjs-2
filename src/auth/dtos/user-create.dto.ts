import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional, ValidateNested } from 'class-validator'
import { ValidationErrorMessage } from '../../common/validation.enum.js';

class UserCreate {
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

// TODO распаковывать пайпом
export class UserCreateRequestDto {
    @ValidateNested()
    user: UserCreate
}