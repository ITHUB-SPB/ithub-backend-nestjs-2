import { Body, Controller, Get, Headers, HttpException, Post, InternalServerErrorException, UnauthorizedException, HttpCode, SerializeOptions } from '@nestjs/common';
import { ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { ValidationErrorMessage } from '../common/validation.enum.js';
import { UserResponseDto, UserResult } from './dtos/user.dto.js';
import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { UserLoginRequestDto } from './dtos/user-login.dto.js';
import AuthToken from '../common/auth-token.decorator.js';

import { Param, NotFoundException } from '@nestjs/common';
import { ProfileResult, ProfileResponseDto } from './dtos/profile.dto.js';

import { ConflictException } from '@nestjs/common';

@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/users')
    @SerializeOptions({ type: UserResponseDto })
    async register(@Body() userCreateDto: UserCreateRequestDto): Promise<UserResponseDto> {
        
    const usernameTaken = await this.authService.getUserByUsername(
        userCreateDto.user.username,
    );

    if (usernameTaken) {
    throw new ConflictException({
        errors: {
        username: [ValidationErrorMessage.CONFLICT],
        },
    });
    }

    const emailTaken = await this.authService.getUserByEmail(
        userCreateDto.user.email,
    );

    if (emailTaken) {
    throw new ConflictException({
        errors: {
        email: [ValidationErrorMessage.CONFLICT],
        },
    });
    }


        try {
            const createdUser = await this.authService.register(userCreateDto)
            const token = await this.authService.createAccessToken(createdUser)
            return new UserResponseDto({ ...createdUser, token })
        } catch (error) {
            // подумать, может быть стоит разделить по типам ошибок
            console.error(error)
            throw new InternalServerErrorException()
        }
    }

    @HttpCode(200)
    @Post('/users/login')
    async login(@Body() userLoginDto: UserLoginRequestDto): Promise<UserResponseDto> {
        const user = await this.authService.getUserByEmail(userLoginDto.user.email)

        if (!user) {
            throw new UnauthorizedException({
                errors: {
                    credentials: ['invalid'],
                },
            });
        }

        const isPasswordCorrect = await this.authService.verifyPassword(
            userLoginDto.user.password,
            user.password,
            );


        if (!isPasswordCorrect) {
            throw new UnauthorizedException({
                errors: {
                    credentials: ['invalid'],
                },
        });
        }

        const token = await this.authService.createAccessToken(user)

        return new UserResponseDto({ ...user, token })
    }

    @ApiBearerAuth('JWT')
    @Get('/user')
    async me(
        @AuthToken() authorizationToken: string,
    ): Promise<UserResponseDto> {
        // решить проблему устаревания данных пэйлоада
        // например, при обновлении биографии пользователя
        // в действующем токене будет устаревшая информация

        const user = await this.authService.getUserByToken(authorizationToken)

        if (!user) {
            throw new UnauthorizedException()
        }

        return new UserResponseDto({
            ...user,
            token: authorizationToken.match(/^(Token|Bearer) (.+)$/)!.at(2)!
        })
    }


    @Get('/profiles/:username')
    async getProfile(
    @Param('username') username: string,
    ): Promise<ProfileResponseDto> {
    const user = await this.authService.getUserByUsername(username);

    if (!user) {
        throw new NotFoundException({
        errors: { profile: ['not found'] },
        });
    }

    return new ProfileResponseDto(
        new ProfileResult({
        username: user.username,
        bio: user.bio ?? null,
        image: user.image === 'default-avatar.png' ? null : user.image,
        }),
    );
    }
}
