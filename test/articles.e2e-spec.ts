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
          username: `art_${uid}`
        }
      }
    }

    await registerHelper(app, uid)
    const loginResponse = await loginHelper(app, uid)
    const token = loginResponse.body.token

    const response = await request(app.getHttpServer())
      .post('/api/articles')
      .set('Authorization', `Token ${token}`)
      .send(body)

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject(expectedResponse)

    for (const property of ['createdAt', 'updatedAt']) {
      assert.isString(response.body[property])
      expect.stringMatching(/^\\d{4}-\\d{2}-\\d{2}T/)
    }
  });

  afterEach(async () => {
    await app.close();
  });
});
