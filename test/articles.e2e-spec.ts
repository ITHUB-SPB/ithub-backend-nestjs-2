import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
  UnprocessableEntityException,
  ValidationError,
} from "@nestjs/common";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import request from "supertest";
import { expect, assert } from "vitest";
import { App } from "supertest/types.js";

import { ArticlesModule } from "../src/articles/articles.module.js";
import { AuthModule } from "../src/auth/auth.module.js";
import { User } from "../src/auth/entities/user.entity.js";
import { Article } from "../src/articles/entities/article.entity.js";

import { loginHelper, registerHelper } from "./helpers.js";

describe("ArticlesController (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          const formattedErrors: Record<string, string[]> = {};
          const extract = (errs: ValidationError[]) => {
            for (const err of errs) {
              if (err.children && err.children.length > 0) {
                extract(err.children);
              } else if (err.constraints) {
                formattedErrors[err.property] = Object.values(err.constraints);
              }
            }
          };
          extract(errors);
          return new UnprocessableEntityException({ errors: formattedErrors });
        },
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();
  });

  beforeEach(async () => {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    const articleRepository = app.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
    await userRepository.clear({ cascade: true });
    await articleRepository.clear({ cascade: true });
  });

  afterAll(async () => {
    await app.close();
  });

  const createArticle = async (token: string, overrides = {}) => {
    return await request(app.getHttpServer())
      .post("/api/articles")
      .set("Authorization", `Token ${token}`)
      .send({
        article: {
          title: "test artitcle",
          description: "test desc",
          body: "test body",
          tagList: [],
          ...overrides,
        },
      });
  };

  describe("POST /api/articles", () => {
    it("Create article with tags /api/articles (POST)", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const response = await createArticle(token, {
        title: `Test Article ${uid}`,
        tagList: [`d_${uid}`, `t_${uid}`],
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.article).toMatchObject({
        title: `Test Article ${uid}`,
        description: "test desc",
        body: "test body",
        tagList: [`d_${uid}`, `t_${uid}`],
        author: { username: `auth_${uid}` },
      });

      assert.isString(response.body.article.createdAt);
      expect(response.body.article.createdAt).toEqual(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/) 
      );
    });

    it("should return 401 without token", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/articles")
        .send({
          article: { title: "No Auth", description: "test", body: "test" },
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.errors.token).toEqual(["is missing"]);
    });

    it("should return 422 on empty title", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const response = await createArticle(token, { title: "" });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors.title).toEqual(["can't be blank"]);
    });

    it("should return 422 on empty description", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const response = await createArticle(token, { description: "" });

      expect(response.statusCode).toBe(422);
      expect(response.body.errors.description).toEqual(["can't be blank"]);
    });
  });

  describe("GET /api/articles/:slug", () => {
    it("should return article by slug", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const createRes = await createArticle(token);
      const slug = createRes.body.article.slug;

      const response = await request(app.getHttpServer()).get(
        `/api/articles/${slug}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.article.slug).toBe(slug);
      expect(response.body.article.author.username).toBe(`auth_${uid}`);
    });

    it("should return 404 for unknown slug", async () => {
      const response = await request(app.getHttpServer()).get(
        "/api/articles/unknown-slug",
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.errors.article).toEqual(["not found"]);
    });
  });

  describe("DELETE /api/articles/:slug", () => {
    it("should delete article by author", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const createRes = await createArticle(token);
      const slug = createRes.body.article.slug;

      const response = await request(app.getHttpServer())
        .delete(`/api/articles/${slug}`)
        .set("Authorization", `Token ${token}`);

      expect(response.statusCode).toBe(204);

      const getRes = await request(app.getHttpServer()).get(
        `/api/articles/${slug}`,
      );
      expect(getRes.statusCode).toBe(404);
    });

    it("should return 403 if user is not the author", async () => {
      const uidA = 1;
      const uidB = 2;
      await registerHelper(app, uidA);
      await registerHelper(app, uidB);

      const loginA = await loginHelper(app, uidA);
      const loginB = await loginHelper(app, uidB);

      const tokenA = loginA.body.user.token;
      const tokenB = loginB.body.user.token;

      const createRes = await createArticle(tokenA);
      const slug = createRes.body.article.slug;

      const response = await request(app.getHttpServer())
        .delete(`/api/articles/${slug}`)
        .set("Authorization", `Token ${tokenB}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.errors.article).toEqual(["forbidden"]);
    });

    it("should return 401 without token", async () => {
      const response = await request(app.getHttpServer()).delete(
        "/api/articles/some-slug",
      );

      expect(response.statusCode).toBe(401);
      expect(response.body.errors.token).toEqual(["is missing"]);
    });

    it("should return 404 for unknown slug", async () => {
      const uid = 1;
      await registerHelper(app, uid);
      const loginResponse = await loginHelper(app, uid);
      const token = loginResponse.body.user.token;

      const response = await request(app.getHttpServer())
        .delete("/api/articles/unknown-slug")
        .set("Authorization", `Token ${token}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.errors.article).toEqual(["not found"]);
    });
  });
});
