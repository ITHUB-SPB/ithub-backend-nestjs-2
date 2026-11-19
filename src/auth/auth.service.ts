import { argon2 } from 'node:crypto'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { User } from './entities/user.entity.js';

import { JwtSigner, JwtVerifier, CurrentUser } from '@nestjs/authentication'

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

    async createAccessToken(payload: User): Promise<string> {
        // быть готовым к ошибкам
        return new JwtSigner({ key: jwtSecretKey }).sign({ sub: JSON.stringify(payload) })
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({
            email
        })
    }

    async getUserByToken(token: string): Promise<User | null> {
        if (!token) {
            return null
        }

        const parsedToken = token.match(/^(Token|Bearer) (.+)$/)

        if (!parsedToken || !parsedToken?.at(2)) {
            return null
        }

        const verifier = new JwtVerifier({ key: jwtSecretKey })

        try {
            const result = await verifier.verify(parsedToken.at(2)!)
            if (!result.sub) {
                throw new Error('No subject in result')
            }
            return JSON.parse(result.sub)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async verifyPassword(plainPassword: string, correctHashedPassword: string): Promise<boolean> {
        const hashedPassword = await this.hashPassword(plainPassword)

        return hashedPassword === correctHashedPassword
    }

    async register(createUserDto: UserCreateRequestDto): Promise<User> {
        const hashedPassword = await this.hashPassword(createUserDto.user.password)

        const userToCreate = this.userRepository.create({
            ...createUserDto.user,
            password: hashedPassword
        })

        return await this.userRepository.save(userToCreate)
    }
}
