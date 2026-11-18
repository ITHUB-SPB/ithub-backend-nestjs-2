import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import { type Repository } from "typeorm";
import request from "supertest";
import { expect, assert } from 'vitest'
import { App } from "supertest/types.js";
import { AuthModule } from "../src/auth/auth.module.js";
import { User } from "../src/auth/entities/user.entity.js";

describe("AuthController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    await userRepository.clear()

    await app.init();
  });

  it("/api/users (POST)", async () => {
    const uid = 1

    const body = {
      user: {
        username: `auth_${uid}`,
        email: `auth_${uid}@test.com`,
        password: `password123`
      }
    }

    const expectedResponse = {
      user: {
        username: `auth_${uid}`,
        email: `auth_${uid}@test.com`,
        bio: null,
        image: "default-avatar.png"
      }
    }

    const response = await request(app.getHttpServer())
      .post("/api/users")
      .send(body)

    expect(response.statusCode).toBe(201)
    expect(response.body).toMatchObject(expectedResponse)

    for (const property of ['token', 'id', 'password']) {
      assert.isString(response.body.user?.[property])
      assert.isNotEmpty(response.body.user[property])
    }

    assert.notExists(response.body.user?.password)
  });

  afterEach(async () => {
    await app.close();
  });
});
