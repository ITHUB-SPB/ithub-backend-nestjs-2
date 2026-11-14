import { Module } from "@nestjs/common";
import { createObserveModule } from "@nestjs/observe";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.js";
import { AuthModule } from './auth/auth.module.js';
import { User } from "./auth/entities/user.entity.js";

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
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5431,
      username: 'postgres',
      password: 'postgres',
      database: 'dev',
      synchronize: true, // не забыть выключить в проде
      entities: [User]
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
