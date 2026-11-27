import { Body, Controller, Get, HttpCode, Param, Post, SerializeOptions, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { ValidationErrorMessage, errorResponse } from '../common/validation.enum.js';
import { UserResponseDto } from './dtos/user.dto.js';
import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { UserLoginRequestDto } from './dtos/user-login.dto.js';
import { ProfileResponseDto } from './dtos/profile.dto.js';
import AuthToken from '../common/auth-token.decorator.js';

@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/users')
    @SerializeOptions({ type: UserResponseDto })
    async register(@Body() userCreateDto: UserCreateRequestDto): Promise<UserResponseDto> {
        const [emailUser, usernameUser] = await Promise.all([
            this.authService.getUserByEmail(userCreateDto.user.email),
            this.authService.getUserByUsername(userCreateDto.user.username),
        ])

        if (usernameUser) {
            throw new ConflictException(errorResponse('username', ValidationErrorMessage.CONFLICT))
        }

        if (emailUser) {
            throw new ConflictException(errorResponse('email', ValidationErrorMessage.CONFLICT))
        }

        const createdUser = await this.authService.register(userCreateDto)
        const token = await this.authService.createAccessToken(createdUser)
        return new UserResponseDto({
            username: createdUser.username,
            email: createdUser.email,
            bio: createdUser.bio ?? null,
            image: createdUser.image ?? null,
            token,
        })
    }

    @HttpCode(200)
    @Post('/users/login')
    async login(@Body() userLoginDto: UserLoginRequestDto): Promise<UserResponseDto> {
        const user = await this.authService.getUserByEmail(userLoginDto.user.email)

        if (!user) {
            throw new UnauthorizedException(errorResponse('credentials', 'invalid'))
        }

        const isPasswordCorrect = await this.authService.verifyPassword(userLoginDto.user.password, user.password)

        if (!isPasswordCorrect) {
            throw new UnauthorizedException(errorResponse('credentials', 'invalid'))
        }

        const token = await this.authService.createAccessToken(user)

        return new UserResponseDto({
            username: user.username,
            email: user.email,
            bio: user.bio ?? null,
            image: user.image ?? null,
            token,
        })
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
            throw new UnauthorizedException(errorResponse('token', 'is missing'))
        }

        return new UserResponseDto({
            username: user.username,
            email: user.email,
            bio: user.bio ?? null,
            image: user.image ?? null,
            token: authorizationToken.match(/^(Token|Bearer) (.+)$/)!.at(2)!
        })
    }

    @Get('/profiles/:username')
    async profile(@Param('username') username: string, @AuthToken() _authorizationToken?: string): Promise<ProfileResponseDto> {
        const user = await this.authService.getUserByUsername(username)
        if (!user) {
            throw new NotFoundException(errorResponse('profile', 'not found'))
        }

        return new ProfileResponseDto({
            username: user.username,
            bio: user.bio ?? null,
            image: user.image === 'default-avatar.png' ? null : user.image ?? null,
        })
    }
}
