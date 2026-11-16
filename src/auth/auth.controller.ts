import { Body, Controller, HttpException, Post, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidationErrorMessage } from '../common/validation.enum.js';
import { UserCreateRequestDto, UserCreateResponseDto } from './dtos/user-create.dto.js';

@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/users')
    async register(@Body() userCreateDto: UserCreateRequestDto): Promise<UserCreateResponseDto> {
        const user = await this.authService.getUserByEmail(userCreateDto.user.email)

        if (user) {
            throw new HttpException(ValidationErrorMessage.CONFLICT, 422)
        }

        try {
            const createdUser = await this.authService.register(userCreateDto)
            const token = await this.authService.createAccessToken(createdUser)
            return { user: { ...createdUser, token } }
        } catch (error) {
            // подумать, может быть стоит разделить по типам ошибок
            console.error(error)
            throw new InternalServerErrorException()
        }
    }
}
