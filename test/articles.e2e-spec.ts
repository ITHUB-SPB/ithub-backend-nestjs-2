import request from 'supertest';

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import {
  createTestApp,
  registerAndGetToken,
  resetDatabase,
  type TestApp,
  type UserCredentials,
} from './helpers.js';

type ArticleData = {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
};

describe('ArticlesController (e2e)', () => {
  let app: TestApp;

  const articleUser: UserCredentials = {
    username: 'art_1',
    email: 'art_1@test.com',
    password: 'password123',
  };

  const createArticle = (token: string, article: ArticleData) =>
    request(app.getHttpServer())
      .post('/api/articles')
      .set('Authorization', `Token ${token}`)
      .send({ article });

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an article with tags', async () => {
    const token = await registerAndGetToken(app, articleUser);
    const article = {
      title: 'Test Article 1',
      description: 'Test description',
      body: 'Test body content',
      tagList: ['d_1', 't_1'],
    };

    const response = await createArticle(token, article);

    expect(response.status).toBe(201);
    expect(response.body.article).toMatchObject({
      ...article,
      slug: 'test-article-1',
      author: {
        username: articleUser.username,
      },
    });
    expect(response.body.article.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it('rejects creating an article without authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/articles')
      .send({
        article: {
          title: 'No Auth Article',
          description: 'test',
          body: 'test',
        },
      });

    expect(response.status).toBe(401);
    expect(response.body.errors.token).toEqual(['is missing']);
  });

  it.each([
    ['title', '', "can't be blank"],
    ['description', '', "can't be blank"],
    ['body', '', "can't be blank"],
  ] as const)(
    'rejects an empty article %s',
    async (field, value, message) => {
      const token = await registerAndGetToken(app, articleUser);
      const article = {
        title: `Article ${field}`,
        description: 'test',
        body: 'test',
        [field]: value,
      };

      const response = await createArticle(token, article);

      expect(response.status).toBe(422);
      expect(response.body.errors[field]).toEqual([message]);
    },
  );

  it('allows duplicate article titles with unique slugs', async () => {
    const token = await registerAndGetToken(app, articleUser);
    const article = {
      title: 'Dup Title 1',
      description: 'first',
      body: 'first',
    };

    const firstResponse = await createArticle(token, article);
    const secondResponse = await createArticle(token, {
      ...article,
      description: 'second',
      body: 'second',
    });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(201);
    expect(secondResponse.body.article.slug).not.toBe(
      firstResponse.body.article.slug,
    );
    expect(secondResponse.body.article.slug).toBe('dup-title-1-2');
  });

  it('gets an article by slug', async () => {
    const token = await registerAndGetToken(app, articleUser);
    const created = await createArticle(token, {
      title: 'Test Article 1',
      description: 'Test description',
      body: 'Test body content',
    });
    const slug = created.body.article.slug;

    const response = await request(app.getHttpServer()).get(
      `/api/articles/${slug}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.article).toMatchObject({
      title: 'Test Article 1',
      slug,
      description: 'Test description',
      body: 'Test body content',
      tagList: [],
      author: {
        username: articleUser.username,
      },
    });
    expect(response.body.article.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it('returns 404 for an unknown article slug', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/articles/unknown-slug-1',
    );

    expect(response.status).toBe(404);
    expect(response.body.errors.article).toEqual(['not found']);
  });

  it('deletes an article and makes it unavailable', async () => {
    const token = await registerAndGetToken(app, articleUser);
    const created = await createArticle(token, {
      title: 'Delete Article',
      description: 'test',
      body: 'test',
    });
    const slug = created.body.article.slug;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/api/articles/${slug}`)
      .set('Authorization', `Token ${token}`);
    const getResponse = await request(app.getHttpServer()).get(
      `/api/articles/${slug}`,
    );

    expect(deleteResponse.status).toBe(204);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body.errors.article).toEqual(['not found']);
  });

  it('rejects deleting an article without authentication', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/api/articles/some-slug',
    );

    expect(response.status).toBe(401);
    expect(response.body.errors.token).toEqual(['is missing']);
  });

  it('returns 404 when deleting an unknown article', async () => {
    const token = await registerAndGetToken(app, articleUser);

    const response = await request(app.getHttpServer())
      .delete('/api/articles/unknown-slug-1')
      .set('Authorization', `Token ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.errors.article).toEqual(['not found']);
  });

  it('returns all unique tags', async () => {
    const token = await registerAndGetToken(app, articleUser);
    await createArticle(token, {
      title: 'Tag Article 1',
      description: 'For tags',
      body: 'Article body',
      tagList: ['h_1', 't_1'],
    });

    const response = await request(app.getHttpServer()).get(
      '/api/tags',
    );

    expect(response.status).toBe(200);
    expect(Object.keys(response.body)).toEqual(['tags']);
    expect(response.body.tags).toEqual(
      expect.arrayContaining(['h_1', 't_1']),
    );
    expect(response.body.tags.length).toBeGreaterThanOrEqual(2);
    expect(response.body.tags).toEqual(
      expect.arrayContaining([
        expect.any(String),
        expect.any(String),
      ]),
    );
  });

  it('forbids another user from deleting an article', async () => {
    const tokenA = await registerAndGetToken(app, {
      username: 'authz_a_1',
      email: 'authz_a_1@test.com',
      password: 'password123',
    });
    const tokenB = await registerAndGetToken(app, {
      username: 'authz_b_1',
      email: 'authz_b_1@test.com',
      password: 'password123',
    });
    const created = await createArticle(tokenA, {
      title: 'Authz Article 1',
      description: 'test',
      body: 'test',
    });

    const response = await request(app.getHttpServer())
      .delete(`/api/articles/${created.body.article.slug}`)
      .set('Authorization', `Token ${tokenB}`);

    expect(response.status).toBe(403);
    expect(response.body.errors.article).toEqual(['forbidden']);
  });
});
