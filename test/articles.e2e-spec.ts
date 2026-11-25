import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { INestApplication, ClassSerializerInterceptor } from "@nestjs/common";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import request from "supertest";
import { expect, assert } from 'vitest'
import { App } from "supertest/types.js";

import { ArticlesModule } from "../src/articles/articles.module.js";
import { AuthModule } from "../src/auth/auth.module.js";
import { User } from "../src/auth/entities/user.entity.js";
import { Article } from "../src/articles/entities/article.entity.js";

import { loginHelper, registerHelper } from "./helpers.js";


describe("ArticlesController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ArticlesModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5431,
          username: 'postgres',
          password: 'postgres',
          database: 'dev',
          synchronize: true, // не забыть выключить в проде
          entities: [User, Article]
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const articleRepository = app.get<Repository<Article>>(getRepositoryToken(Article));

    await userRepository.clear({ cascade: true })
    await articleRepository.clear({ cascade: true })

    await app.init();
  });

  it("Create article with tags /api/articles (POST)", async () => {
    const uid = 1

    const body = {
      article: {
        title: `Test Article ${uid}`,
        description: "Test description",
        body: "Test body content",
        tagList: [`d_${uid}`, `t_${uid}`]
      }
    }

    const expectedResponse = {
      article: {
        title: `Test Article ${uid}`,
        description: "Test description",
        body: "Test body content",
        tagList: [`d_${uid}`, `t_${uid}`],
        author: {
          username: `auth_${uid}`
        }
      }
    }

    await registerHelper(app, uid)
    const loginResponse = await loginHelper(app, uid)
    const token = loginResponse.body.user.token;

    const response = await request(app.getHttpServer())
      .post('/api/articles')
      .set('Authorization', `Token ${token}`)
      .send(body)

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject(expectedResponse)

    assert.isString(response.body.article.createdAt);
    expect(response.body.article.createdAt).toEqual(
    expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/)
  );
});

it('получение тегов статей (GET /api/tags)', async () => {
  const uid = 2;

  const registerResponse = await registerHelper(app, uid);
  const token = registerResponse.body.user.token;

  await request(app.getHttpServer())
    .post('/api/articles')
    .set('Authorization', `Token ${token}`)
    .send({
      article: {
        title: 'Test Tags Article',
        description: 'Description',
        body: 'Article body',
        tagList: ['nestjs', 'typescript'],
      },
    })
    .expect(201);

  const response = await request(app.getHttpServer())
    .get('/api/tags')
    .expect(200);

  expect(response.body).toHaveProperty('tags');
  expect(response.body.tags).toContain('nestjs');
  expect(response.body.tags).toContain('typescript');
});


it('получение статьи по slug (GET /api/articles/:slug)', async () => {
  const uid = 3;

  const registerResponse = await registerHelper(app, uid);
  const token = registerResponse.body.user.token;

  const createResponse = await request(app.getHttpServer())
    .post('/api/articles')
    .set('Authorization', `Token ${token}`)
    .send({
      article: {
        title: 'My Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['nestjs', 'backend'],
      },
    })
    .expect(201);

  const slug = createResponse.body.article.slug;

  const response = await request(app.getHttpServer())
    .get(`/api/articles/${slug}`)
    .expect(200);

  expect(response.body.article).toMatchObject({
    slug,
    title: 'My Test Article',
    description: 'Test description',
    body: 'Test body',
    tagList: ['nestjs', 'backend'],
    author: {
      username: 'auth_3',
    },
  });

  await request(app.getHttpServer())
    .get('/api/articles/nonexistent-article')
    .expect(404);
});

it('удаление статьи (DELETE /api/articles/:slug)', async () => {
  const owner = await registerHelper(app, 4);
  const other = await registerHelper(app, 5);

  const ownerToken = owner.body.user.token;
  const otherToken = other.body.user.token;

  const created = await request(app.getHttpServer())
    .post('/api/articles')
    .set('Authorization', `Token ${ownerToken}`)
    .send({
      article: {
        title: 'Article To Delete',
        description: 'Test description',
        body: 'Test content',
        tagList: ['testing'],
      },
    })
    .expect(201);

  const slug = created.body.article.slug;

  await request(app.getHttpServer())
    .delete(`/api/articles/${slug}`)
    .expect(401);

  const forbidden = await request(app.getHttpServer())
    .delete(`/api/articles/${slug}`)
    .set('Authorization', `Token ${otherToken}`)
    .expect(403);

  expect(forbidden.body.errors.article).toContain('forbidden');

  await request(app.getHttpServer())
    .delete(`/api/articles/${slug}`)
    .set('Authorization', `Token ${ownerToken}`)
    .expect(204);

  await request(app.getHttpServer())
    .get(`/api/articles/${slug}`)
    .expect(404);
});

  afterEach(async () => {
    await app.close();
  });
});
