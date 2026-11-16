import { argon2 } from 'node:crypto'
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dtos/user-create.dto.js';
import { UserCurrentDto } from './dtos/user-current.dto.js';
import { User } from './entities/user.entity.js';

import { JwtSigner } from '@nestjs/authentication'

const argon2Key = '69f21d6966c50daf'
const jwtSecretKey = '63ab69f21d6966c50dafd3f7c607ddd8'


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async hashPassword(plainPassword: string): Promise<string> {
        return new Promise((resolve, reject) => {
            argon2('argon2id', {
                message: plainPassword,
                nonce: argon2Key,
                parallelism: 4,
                tagLength: 64,
                memory: 65536,
                passes: 3,
            }, (error, result) => {
                if (error) {
                    reject(error)
                }
                resolve(result.toString('hex'))
            })
        })
    }

    async createAccessToken(payload: UserCurrentDto): Promise<string> {
        // быть готовым к ошибкам
        return new JwtSigner({ key: jwtSecretKey }).sign({ sub: JSON.stringify(payload) })
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({
            email
        })
    }

    async register(createUserDto: UserCreateDto): Promise<User> {
        const hashedPassword = await this.hashPassword(createUserDto.password)

        const userToCreate = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword
        })

        return await this.userRepository.save(userToCreate)
    }
}
