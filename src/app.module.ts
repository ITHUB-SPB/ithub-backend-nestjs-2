import { Module, ClassSerializerInterceptor } from "@nestjs/common";
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { createObserveModule } from "@nestjs/observe";
import { TypeOrmModule } from "@nestjs/typeorm";

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
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? "YOUR_APP_KEY",
      appSecret: process.env.OBSERVE_APP_SECRET ?? "YOUR_APP_SECRET",
      serviceId: "ithub-backend-nestjs-2",
    }),
    AuthModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5431,
      username: 'postgres',
      password: 'postgres',
      database: 'dev',
      synchronize: true, // не забыть выключить в проде
      entities: [User, Article, Role, Session, RefreshToken, EmailToken]
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
  ],
  controllers: [AppController],
})
export class AppModule { }
