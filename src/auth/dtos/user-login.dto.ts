import { IsString, IsNotEmpty, IsEmail, ValidateNested } from 'class-validator'
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
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    @IsEmail({}, { message: ValidationErrorMessage.INVALID })
    email: string;
}

export class UserLoginRequestDto {
    @ValidateNested()
    @Type(() => UserLogin)
    user: UserLogin
}
