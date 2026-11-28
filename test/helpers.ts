import { Test } from '@nestjs/testing';
import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { Article } from '../src/articles/entities/article.entity.js';
import { User } from '../src/auth/entities/user.entity.js';

export type TestApp = INestApplication<App>;

export type UserCredentials = {
  username: string;
  email: string;
  password: string;
};

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors: Record<string, string[]> = {};

        const addErrors = (items: ValidationError[]) => {
          for (const item of items) {
            if (item.children?.length) {
              addErrors(item.children);
              continue;
            }

            const message =
              item.value === '' ||
              item.value === null ||
              item.value === undefined
                ? "can't be blank"
                : (Object.values(item.constraints ?? {})[0] ??
                  'is invalid');
            errors[item.property] ??= [];
            if (!errors[item.property].includes(message)) {
              errors[item.property].push(message);
            }
          }
        };

        addErrors(validationErrors);
        return new UnprocessableEntityException({ errors });
      },
    }),
  );
  await app.init();

  return app as TestApp;
}

export async function resetDatabase(app: TestApp): Promise<void> {
  const articleRepository = app.get<Repository<Article>>(
    getRepositoryToken(Article),
  );
  const userRepository = app.get<Repository<User>>(
    getRepositoryToken(User),
  );

  await articleRepository.createQueryBuilder().delete().from(Article).execute();
  await userRepository.createQueryBuilder().delete().from(User).execute();
}

export function registerUser(
  app: TestApp,
  credentials: UserCredentials,
) {
  return request(app.getHttpServer()).post('/api/users').send({
    user: credentials,
  });
}

export function loginUser(
  app: TestApp,
  credentials: Pick<UserCredentials, 'email' | 'password'>,
) {
  return request(app.getHttpServer()).post('/api/users/login').send({
    user: credentials,
  });
}

export async function registerAndGetToken(
  app: TestApp,
  credentials: UserCredentials,
): Promise<string> {
  const response = await registerUser(app, credentials);
  if (
    response.status !== 201 ||
    typeof response.body.user?.token !== 'string'
  ) {
    throw new Error(`Failed to register test user: ${response.text}`);
  }
  return response.body.user.token;
}
