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
  loginUser,
  registerAndGetToken,
  registerUser,
  resetDatabase,
  type TestApp,
  type UserCredentials,
} from './helpers.js';

describe('AuthController (e2e)', () => {
  let app: TestApp;

  const validUser: UserCredentials = {
    username: 'auth_1',
    email: 'auth_1@test.com',
    password: 'password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user', async () => {
    const response = await registerUser(app, validUser);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: {
        username: validUser.username,
        email: validUser.email,
        bio: null,
        image: 'default-avatar.png',
      },
    });
    expect(response.body.user.token).toEqual(expect.any(String));
    expect(response.body.user.token).not.toBe('');
    expect(response.body.user.password).toBeUndefined();
  });

  it('logs in a registered user', async () => {
    await registerUser(app, validUser);

    const response = await loginUser(app, {
      email: validUser.email,
      password: validUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: {
        username: validUser.username,
        email: validUser.email,
        bio: null,
        image: 'default-avatar.png',
      },
    });
    expect(response.body.user.token).toEqual(expect.any(String));
    expect(response.body.user.password).toBeUndefined();
  });

  it.each([
    ['username', '', 'validation_username'],
    ['email', '', 'validation_email'],
    ['password', '', 'validation_password'],
  ] as const)(
    'rejects an empty %s on registration',
    async (field, value, suffix) => {
      const user = {
        username: `user_${suffix}`,
        email: `${suffix}@test.com`,
        password: 'password123',
        [field]: value,
      };

      const response = await registerUser(app, user);

      expect(response.status).toBe(422);
      expect(response.body.errors[field]).toEqual(["can't be blank"]);
    },
  );

  it('rejects a malformed registration email', async () => {
    const response = await registerUser(app, {
      ...validUser,
      username: 'malformed_email',
      email: 'malformed_email_not_an_email',
    });

    expect(response.status).toBe(422);
    expect(response.body.errors.email).toEqual(['is invalid']);
  });

  it('rejects a duplicate username', async () => {
    await registerUser(app, validUser);

    const response = await registerUser(app, {
      ...validUser,
      email: 'another_email@test.com',
    });

    expect(response.status).toBe(409);
    expect(response.body.errors.username).toEqual([
      'has already been taken',
    ]);
  });

  it('rejects a duplicate email', async () => {
    await registerUser(app, validUser);

    const response = await registerUser(app, {
      ...validUser,
      username: 'another_username',
    });

    expect(response.status).toBe(409);
    expect(response.body.errors.email).toEqual([
      'has already been taken',
    ]);
  });

  it.each([
    ['email', '', "can't be blank"],
    ['password', '', "can't be blank"],
  ] as const)(
    'rejects an empty login %s',
    async (field, value, message) => {
      await registerUser(app, validUser);

      const credentials = {
        email: validUser.email,
        password: validUser.password,
        [field]: value,
      };
      const response = await loginUser(app, credentials);

      expect(response.status).toBe(422);
      expect(response.body.errors[field]).toEqual([message]);
    },
  );

  it('rejects a malformed login email', async () => {
    const response = await loginUser(app, {
      email: 'auth_1@',
      password: validUser.password,
    });

    expect(response.status).toBe(422);
    expect(response.body.errors.email).toEqual(['is invalid']);
  });

  it('rejects a wrong password', async () => {
    await registerUser(app, validUser);

    const response = await loginUser(app, {
      email: validUser.email,
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.errors.credentials).toEqual(['invalid']);
  });

  it('gets the current user with a token', async () => {
    const currentUser = {
      ...validUser,
      username: 'current_user',
      email: 'current_user@test.com',
    };
    const token = await registerAndGetToken(app, currentUser);

    const response = await request(app.getHttpServer())
      .get('/api/user')
      .set('Authorization', `Token ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      username: currentUser.username,
      email: currentUser.email,
      bio: null,
      image: 'default-avatar.png',
    });
    expect(response.body.user.token).toBe(token);
  });

  it('rejects getting the current user without a token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/user',
    );

    expect(response.status).toBe(401);
    expect(response.body.errors.token).toEqual(['is missing']);
  });

  it('gets a profile without authentication', async () => {
    await registerUser(app, {
      ...validUser,
      username: 'profile_user',
      email: 'profile_user@test.com',
    });

    const response = await request(app.getHttpServer()).get(
      '/api/profiles/profile_user',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      profile: {
        username: 'profile_user',
        bio: null,
        image: null,
      },
    });
  });

  it('gets a profile with authentication', async () => {
    const profileUser = {
      ...validUser,
      username: 'profile_user',
      email: 'profile_user@test.com',
    };
    await registerUser(app, profileUser);
    const token = await registerAndGetToken(app, {
      ...validUser,
      username: 'profile_viewer',
      email: 'profile_viewer@test.com',
    });

    const response = await request(app.getHttpServer())
      .get('/api/profiles/profile_user')
      .set('Authorization', `Token ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.profile).toEqual({
      username: 'profile_user',
      bio: null,
      image: null,
    });
  });
});
