import { argon2 } from 'node:crypto'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserCreateRequestDto } from './dtos/user-create.dto.js';
import { User } from './entities/user.entity.js';
import { Role } from './entities/role.entity.js';

import { JwtSigner, } from '@nestjs/authentication'

const argon2Key = '69f21d6966c50daf' // TODO: перенести в env, принимать через ConfigService
const jwtSecretKey = '63ab69f21d6966c50dafd3f7c607ddd8'  // TODO: избавиться


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>,
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

    async markVerified(userId: string, email: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({
            id: userId,
            email
        })

        if (!user) {
            return false
        }

        await this.userRepository.save({
            ...user,
            emailVerified: true
        })

        return true
    }

    async createAccessToken(payload: User): Promise<string> {
        // TODO: избавиться, заменив на встроенные методы
        return new JwtSigner({ key: jwtSecretKey }).sign({ sub: JSON.stringify(payload) })
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({
            email
        })
    }

    async verifyPassword(plainPassword: string, correctHashedPassword: string): Promise<boolean> {
        const hashedPassword = await this.hashPassword(plainPassword)

        return hashedPassword === correctHashedPassword
    }

    async register(createUserDto: UserCreateRequestDto): Promise<User> {
        const hashedPassword = await this.hashPassword(createUserDto.user.password)

        const role = await this.roleRepository.findOneOrFail({
            where: {
                id: createUserDto.user.role
            }
        })

        const userToCreate = this.userRepository.create({
            ...createUserDto.user,
            password: hashedPassword,
            role
        })

        return await this.userRepository.save(userToCreate)
    }
}
