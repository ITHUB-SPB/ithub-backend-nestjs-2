import { Body, Controller, HttpException, Post, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ValidationErrorMessage } from '../common/validation.enum.js';
import { UserCreateDto, UserCreateResultDto } from './dtos/user-create.dto.js';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/users')
    async register(@Body() userCreateDto: UserCreateDto): Promise<UserCreateResultDto> {
        const user = await this.authService.getUserByEmail(userCreateDto.email)

        if (user) {
            throw new HttpException(ValidationErrorMessage.CONFLICT, 422)
        }

        try {
            const createdUser = await this.authService.register(userCreateDto)
            const token = await this.authService.createAccessToken(createdUser)
            return { ...createdUser, token }
        } catch (error) {
            // подумать, может быть стоит разделить по типам ошибок
            console.error(error)
            throw new InternalServerErrorException()
        }
    }
}
