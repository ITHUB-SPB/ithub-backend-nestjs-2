import { Body, Controller, Get, Headers, HttpException, Post, InternalServerErrorException, UnauthorizedException, HttpCode, SerializeOptions, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SignInService, Public, Authenticate, CurrentSession, CurrentUser, SessionCookieProvider } from '@nestjs/authentication';
import { EmailVerificationService } from '@nestjs/authentication';

import { AuthService } from './auth.service.js';
import { ValidationErrorMessage } from '../common/validation.enum.js';
import { UserResponseDto, UserResult } from './dtos/user.dto.js';
import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { UserLoginRequestDto } from './dtos/user-login.dto.js';
import AuthToken from '../common/auth-token.decorator.js';
import { User } from './entities/user.entity.js';

@Controller('api')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly signInService: SignInService,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    @Public()
    @Post('/users')
    @SerializeOptions({ type: UserResponseDto })
    async register(@Body() userCreateDto: UserCreateRequestDto): Promise<UserResponseDto> {
        const user = await this.authService.getUserByEmail(userCreateDto.user.email)

        if (user) {
            throw new HttpException(ValidationErrorMessage.CONFLICT, 422)
        }

        try {
            const createdUser = await this.authService.register(userCreateDto)
            await this.signInService.signIn(createdUser.email, { method: 'password' })
            await this.emailVerificationService.send(createdUser)

            // подумать, всегда ли требуется возвращать access-токены
            const token = await this.authService.createAccessToken(createdUser)
            return new UserResponseDto({ ...createdUser, token })
        } catch (error) {
            // подумать, может быть стоит разделить по типам ошибок
            console.error(error)
            throw new InternalServerErrorException()
        }
    }

    @Public()
    @HttpCode(200)
    @Get('/users/verify')
    async verify(@Query('token') token: string) {
        const verified = await this.emailVerificationService.verify(token)

        if (!verified) {
            throw new UnauthorizedException('Invalid or expired link')
        }

        return { email: verified.email, emailVerified: true }
    }

    @Public()
    @HttpCode(200)
    @Post('/users/login')
    async login(@Body() userLoginDto: UserLoginRequestDto): Promise<UserResponseDto> {
        const user = await this.authService.getUserByEmail(userLoginDto.user.email)

        if (!user) {
            throw new UnauthorizedException()
        }

        const isPasswordCorrect = this.authService.verifyPassword(userLoginDto.user.password, user.password)

        if (!isPasswordCorrect) {
            throw new UnauthorizedException()
        }

        // подумать, для чего может понадобиться {session}
        const { session } = await this.signInService.signIn(user.email, { method: 'password' })

        // подумать, всегда ли требуется возвращать access-токены
        const token = await this.authService.createAccessToken(user)

        return new UserResponseDto({ ...user, token })
    }

    // @ApiBearerAuth('JWT')
    @Authenticate({
        providers: [SessionCookieProvider],
        verifiedEmail: true
    })
    @Get('/user')
    async me(
        @CurrentUser() user: User, // TODO: не требовать одновременной подачи хедера и кук 
        @AuthToken() authorizationToken: string,
    ): Promise<UserResponseDto> {
        // решить проблему устаревания данных пэйлоада
        // например, при обновлении биографии пользователя
        // в действующем токене будет устаревшая информация

        // const user = await this.authService.getUserByToken(authorizationToken)

        // if (!user) {
        //     throw new UnauthorizedException()
        // }

        return new UserResponseDto({
            ...user,
            token: authorizationToken.match(/^(Token|Bearer) (.+)$/)!.at(2)!
        })
    }
}
