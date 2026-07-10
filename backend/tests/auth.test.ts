import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();
const api = () => request(app);

const validUser = {
  email: 'alice@example.com',
  username: 'alice',
  displayName: 'Alice',
  password: 'Sup3rSecret',
};

describe('Auth API', () => {
  it('registers a new user and returns an access token', async () => {
    const res = await api().post('/api/v1/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alice@example.com');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.accessToken).toBeTypeOf('string');
  });

  it('rejects a weak password', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ ...validUser, password: 'weak' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('rejects duplicate email', async () => {
    await api().post('/api/v1/auth/register').send(validUser);
    const res = await api().post('/api/v1/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials and rejects bad ones', async () => {
    await api().post('/api/v1/auth/register').send(validUser);

    const good = await api()
      .post('/api/v1/auth/login')
      .send({ identifier: 'alice', password: validUser.password });
    expect(good.status).toBe(200);
    expect(good.body.data.accessToken).toBeTypeOf('string');

    const bad = await api()
      .post('/api/v1/auth/login')
      .send({ identifier: 'alice', password: 'wrongpass' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user from /auth/me with a bearer token', async () => {
    const reg = await api().post('/api/v1/auth/register').send(validUser);
    const token = reg.body.data.accessToken as string;

    const me = await api().get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.username).toBe('alice');

    const unauth = await api().get('/api/v1/auth/me');
    expect(unauth.status).toBe(401);
  });
});
