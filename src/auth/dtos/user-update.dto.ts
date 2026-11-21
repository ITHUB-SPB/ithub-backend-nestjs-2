import { IsString, IsStrongPassword, IsNotEmpty, IsEmail, IsOptional } from 'class-validator'
import { Type } from 'class-transformer';
import { ValidationErrorMessage } from '../../common/validation.enum.js';

export class UserUpdateDto {
    @IsOptional()
    username: string;

    @IsOptional()
    password: string;

    @IsOptional()
    email: string;

    @IsOptional()
    bio: string;

    @IsOptional()
    image: string;
}