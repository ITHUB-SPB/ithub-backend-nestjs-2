import { Body, Controller, Get, Headers, HttpException, Post, InternalServerErrorException, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidationErrorMessage } from '../common/validation.enum.js';
import { UserResponseDto, UserResult } from './dtos/user-base.dto.js';
import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { UserLoginRequestDto } from './dtos/user-login.dto.js';

@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/users')
    async register(@Body() userCreateDto: UserCreateRequestDto): Promise<UserResponseDto> {
        const user = await this.authService.getUserByEmail(userCreateDto.user.email)

        if (user) {
            throw new HttpException(ValidationErrorMessage.CONFLICT, 422)
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
            throw new UnauthorizedException()
        }

        const isPasswordCorrect = this.authService.verifyPassword(userLoginDto.user.password, user.password)

        if (!isPasswordCorrect) {
            throw new UnauthorizedException()
        }

        const token = await this.authService.createAccessToken(user)

        return new UserResponseDto({ ...user, token })
    }

    @Get('/user')
    async me(@Headers('Authorization') token: string): Promise<UserResponseDto> {
        // решить проблему устаревания данных пэйлоада
        // например, при обновлении биографии пользователя
        // в действующем токене будет устаревшая информация

        const user = await this.authService.getUserByToken(token)

        if (!user) {
            throw new UnauthorizedException()
        }

        // создать dto без токена
        return { user: { ...user, token: await this.authService.createAccessToken(user) } }
    }
}
