import { Module, ClassSerializerInterceptor } from "@nestjs/common";
import { APP_INTERCEPTOR, APP_GUARD, Reflector } from '@nestjs/core';
import { createObserveModule } from "@nestjs/observe";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule, minutes, normalizeIp } from '@nestjs/throttler'

import { AppController } from "./app.controller.js";

import { AuthModule } from './auth/auth.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { MailModule } from './mail/mail.module.js';

import { Role } from './auth/entities/role.entity.js';
import { User } from "./auth/entities/user.entity.js";
import { Session } from './auth/entities/session.entity.js';
import { RefreshToken } from './auth/entities/refresh-token.entity.js';
import { EmailToken } from './auth/entities/email-token.entity.js';
import { Article } from "./articles/entities/article.entity.js";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ ignoreEnvFile: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default', ttl: minutes(1), limit: 100, blockDuration: minutes(10) }
        // TODO 1: дописать skipIf для юнит-тестов (игнорировать в тестовом окружении)
        // TODO 2: написать отдельный тротлер для маршрутов аутентификации
      ]
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? "YOUR_APP_KEY",
      appSecret: process.env.OBSERVE_APP_SECRET ?? "YOUR_APP_SECRET",
      serviceId: "ithub-backend-nestjs-2",
    }),
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow('DATABASE_HOST'),
        port: Number(config.getOrThrow('DATABASE_PORT')),
        username: config.getOrThrow('DATABASE_USER'),
        password: config.getOrThrow('DATABASE_PASSWORD'),
        database: config.getOrThrow('DATABASE_DB'),
        synchronize: true, // не забыть выключить в проде
        entities: [User, Article, Role, Session, RefreshToken, EmailToken]
      })
    }),
    ArticlesModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector) => {
        return new ClassSerializerInterceptor(reflector, {
          enableImplicitConversion: false,
          excludeExtraneousValues: true,
        });
      },
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard }
  ],
  controllers: [AppController],
})
export class AppModule { }
