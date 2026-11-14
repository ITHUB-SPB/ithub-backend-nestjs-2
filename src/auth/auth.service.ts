import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dtos/user-create.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async register(createUserDto: UserCreateDto) {
        try {
            await this.userRepository.insert(createUserDto)
        } catch (error) {
            // ...
        }
    }
}
