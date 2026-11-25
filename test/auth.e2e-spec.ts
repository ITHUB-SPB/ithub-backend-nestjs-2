
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { type Repository } from 'typeorm';
import request from 'supertest';
import { expect, assert } from 'vitest';
import { App } from 'supertest/types.js';

import { ArticlesModule } from '../src/articles/articles.module.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { User } from '../src/auth/entities/user.entity.js';
import { Article } from '../src/articles/entities/article.entity.js';

import { loginHelper, registerHelper } from './helpers.js';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ArticlesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5431,
          username: 'postgres',
          password: 'postgres',
          database: 'dev',
          synchronize: true,
          entities: [User, Article],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        errorHttpStatusCode: 422,
        exceptionFactory: (errors) => {
          const fieldErrors: Record<string, string[]> = {};

          for (const error of errors) {
            const fields = error.children?.length
              ? error.children
              : [error];

            for (const field of fields) {
              const constraints = field.constraints ?? {};

              const message =
                constraints.isNotEmpty ??
                constraints.isEmail ??
                Object.values(constraints)[0] ??
                'is invalid';

              fieldErrors[field.property] = [message];
            }
          }

          return new UnprocessableEntityException({
            errors: fieldErrors,
          });
        },
      }),
    );

    const userRepository = app.get<Repository<User>>(
      getRepositoryToken(User),
    );

    const articleRepository = app.get<Repository<Article>>(
      getRepositoryToken(Article),
    );

    await userRepository.clear({ cascade: true });
    await articleRepository.clear({ cascade: true });

    await app.init();
  });

  // ТЕСТ 1 — Успешная регистрация
  it('REGISTER /api/users (POST)', async () => {
    const uid = 1;

    const expectedResponse = {
      user: {
        username: `auth_${uid}`,
        email: `auth_${uid}@test.com`,
        bio: null,
        image: 'default-avatar.png',
      },
    };

    const response = await registerHelper(app, uid);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(expectedResponse);

    assert.isString(response.body.user?.token);
    assert.isNotEmpty(response.body.user.token);
    assert.notExists(response.body.user?.password);
  });

  // ТЕСТ 2 — Успешный вход
  it('LOGIN /api/users/login (POST)', async () => {
    const uid = 1;

    await registerHelper(app, uid);

    const expectedResponse = {
      user: {
        username: `auth_${uid}`,
        email: `auth_${uid}@test.com`,
        bio: null,
        image: 'default-avatar.png',
      },
    };

    const response = await loginHelper(app, uid);

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(expectedResponse);

    assert.isString(response.body.user?.token);
    assert.isNotEmpty(response.body.user.token);
    assert.notExists(response.body.user?.password);
  });

  // ТЕСТ 3 — Получение текущего пользователя
  it('GET CURRENT /api/user (GET)', async () => {
    const uid = 1;

    await registerHelper(app, uid);

    const loginResponse = await loginHelper(app, uid);
    const token = loginResponse.body.user.token;

    const response = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Token ${token}`);

    const expectedResponse = {
      user: {
        username: `auth_${uid}`,
        email: `auth_${uid}@test.com`,
        bio: null,
        image: 'default-avatar.png',
      },
    };

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(expectedResponse);

    assert.isString(response.body.user?.token);
    assert.isNotEmpty(response.body.user.token);
    assert.notExists(response.body.user?.password);
  });

  // ТЕСТ 4 — Получение публичного профиля
  it('получение профиля пользователя (GET /api/profiles/:username)', async () => {
    const uid = 6;

    const registered = await registerHelper(app, uid);
    const token = registered.body.user.token;
    const username = `auth_${uid}`;

    const response = await request(app.getHttpServer())
      .get(`/api/profiles/${username}`)
      .expect(200);

    expect(response.body).toEqual({
      profile: {
        username,
        bio: null,
        image: null,
      },
    });

    await request(app.getHttpServer())
      .get(`/api/profiles/${username}`)
      .set('Authorization', `Token ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/profiles/unknown_user')
      .expect(404);
  });

  // ТЕСТЫ 5–8 — Ошибки валидации при регистрации
  it.each([
    ['username', '', "can't be blank"],
    ['email', '', "can't be blank"],
    ['password', '', "can't be blank"],
    ['email', 'wrong-email', 'is invalid'],
  ])(
    'ошибка регистрации: %s = %s',
    async (field, value, message) => {
      const user = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        [field]: value,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({ user });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors[field]).toContain(message);
    },
  );

  // ТЕСТ 9 — Повторяющиеся username и email
  it('ошибка регистрации: повторяющиеся username и email', async () => {
    const uid = 7;

    await registerHelper(app, uid);

    const duplicateUsername = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        user: {
          username: `auth_${uid}`,
          email: 'another@test.com',
          password: 'password123',
        },
      });

    expect(duplicateUsername.statusCode).toBe(409);
    expect(duplicateUsername.body.errors.username).toContain(
      'has already been taken',
    );

    const duplicateEmail = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        user: {
          username: 'another_user',
          email: `auth_${uid}@test.com`,
          password: 'password123',
        },
      });

    expect(duplicateEmail.statusCode).toBe(409);
    expect(duplicateEmail.body.errors.email).toContain(
      'has already been taken',
    );
  });

  // ТЕСТЫ 10–13 — Ошибки при входе
  it.each([
    [
      'пустой email',
      '',
      'password123',
      422,
      'email',
      "can't be blank",
    ],
    [
      'пустой пароль',
      'auth_8@test.com',
      '',
      422,
      'password',
      "can't be blank",
    ],
    [
      'неверный email',
      'wrong-email',
      'password123',
      422,
      'email',
      'is invalid',
    ],
    [
      'неверный пароль',
      'auth_8@test.com',
      'wrongpassword',
      401,
      'credentials',
      'invalid',
    ],
  ])(
    'ошибка входа: %s',
    async (_, email, password, status, field, message) => {
      await registerHelper(app, 8);

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          user: {
            email,
            password,
          },
        });

      expect(response.statusCode).toBe(status);
      expect(response.body.errors[field]).toContain(message);
    },
  );

  afterEach(async () => {
    await app.close();
  });
});
