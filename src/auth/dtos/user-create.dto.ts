import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional, ValidateNested, IsIn } from 'class-validator'
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import type { RoleId } from '../entities/role.entity.js';
import { ValidationErrorMessage } from '../../common/validation.enum.js';

class UserCreate {
    @ApiProperty({ example: "auth_1" })
    @IsString({ message: ValidationErrorMessage.REQUIRED })
    @IsNotEmpty({ message: ValidationErrorMessage.REQUIRED })
    // проверка на одно слово
    username: string;

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

    @ApiProperty({ example: "author" })
    @IsIn(["author", "moderator", "superadmin"])
    role: RoleId;
}

// TODO распаковывать пайпом
export class UserCreateRequestDto {
    @ValidateNested()
    @Type(() => UserCreate)
    user: UserCreate
}