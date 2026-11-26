import { join } from 'node:path'

import { Module, ClassSerializerInterceptor } from "@nestjs/common";
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { AuthenticationModule } from "@nestjs/authentication";
import { MailModule as GlobalMailModule, SmtpTransport, LogMailTransport, FileTemplateEngine } from "@nestjs/mail";
import { createObserveModule } from "@nestjs/observe";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller.js";

import { AuthModule } from './auth/auth.module.js';
import { ArticlesModule } from './articles/articles.module.js';
import { MailModule } from './mail/mail.module.js';

import { Role } from './auth/entities/role.entity.js';
import { User } from "./auth/entities/user.entity.js";
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
    GlobalMailModule.forRoot({
      transport: process.env.NODE_ENV === "production"
        ? new SmtpTransport({
          secure: false,
          port: Number(process.env.SMTP_PORT),
          host: process.env.SMTP_HOST,
          auth: {
            user: process.env.SMTP_USER ?? "",
            pass: process.env.SMTP_PASSWORD ?? "",
          }
        })
        : new LogMailTransport(),
      templates: new FileTemplateEngine({ dir: join(import.meta.dirname, 'mail', 'templates') }),
      from: `Support <noreply@medium.com>`
    }),
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
        cookie: {
          path: '/',
          secure: false,
          sameSite: 'lax'
        },
        cookieName: 'realworld__session'
      },
      emailVerification: { url: 'http://localhost:3000/api/users/verify' }
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5431,
      username: 'postgres',
      password: 'postgres',
      database: 'dev',
      synchronize: true, // не забыть выключить в проде
      entities: [User, Article, Role]
    }),
    AuthModule,
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
