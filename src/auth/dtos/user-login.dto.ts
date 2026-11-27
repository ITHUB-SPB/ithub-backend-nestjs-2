import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorMessage } from '../../common/validation.enum.js';

class UserLogin {
    @ApiProperty({ example: "password123" })
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // @IsStrongPassword({ message: ValidationErrorMessage.INVALID })
    password: string;

    @ApiProperty({ example: "auth_1@test.com" })
    @IsEmail({},{ message: ValidationErrorMessage.INVALID })
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    email: string;
}

// TODO распаковывать пайпом
export class UserLoginRequestDto {
    @ValidateNested()
    @Type(() => UserLogin)
    user: UserLogin
}