import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorMessage } from '../../common/validation.enum.js';

class UserLogin {
    @ApiProperty({ example: "password123" })
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // @IsStrongPassword({ message: ValidationErrorMessage.INVALID })
    password: string;

    @ApiProperty({ example: "auth_1@test.com" })
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // @IsEmail({ message: ValidationErrorMessage.INVALID })
    email: string;
}

// TODO распаковывать пайпом
export class UserLoginRequestDto {
    @ValidateNested()
    user: UserLogin
}

class UserLoginResult {
    username: string;
    email: string;
    bio: string | null;
    image: string | null;
    token: string;
}

export class UserLoginResponseDto {
    @ValidateNested()
    user: UserLoginResult
}