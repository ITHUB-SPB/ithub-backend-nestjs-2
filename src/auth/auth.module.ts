import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { type Repository } from 'typeorm';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthenticationStore } from './providers/auth.store.js'
import { JwtAuth } from './providers/jwt-auth.provider.js';
import { SessionAuth } from './providers/session-auth.provider.js';
import { Role } from './entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { Session } from './entities/session.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { EmailToken } from './entities/email-token.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, RefreshToken, EmailToken, Role]),
    AuthenticationModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        session: {
          absoluteTtl: '14d',
          idleTtl: '3d',
          cookieName: 'realworld__session'
        },
        accessToken: {
          key: config.getOrThrow('JWT_SECRET'),
          ttl: '15m',
          issuer: 'http://localhost:3000',
          audience: 'jwt' // подумать, нужен ли
        },
        emailVerification: { url: 'http://localhost:3000/api/users/verify' },
      })
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionAuth, JwtAuth, AuthenticationStore],
  exports: [AuthService]
})
export class AuthModule implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) { }

  onModuleInit() {
    const roles = [
      { id: 'author', title: 'Автор' },
      { id: 'moderator', title: 'Модератор' },
      { id: 'superadmin', title: 'Администратор' }
    ] as const;

    for (const { id, title } of roles) {
      this.roleRepository.upsert({
        id,
        title
      }, { conflictPaths: ['id'] })
    }

  }
}
