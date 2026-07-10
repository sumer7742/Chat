import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

async function makeUser(suffix: string) {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      email: `u${suffix}@example.com`,
      username: `user${suffix}`,
      displayName: `User ${suffix}`,
      password: 'Sup3rSecret',
    });
  return { token: res.body.data.accessToken as string, id: res.body.data.user._id as string };
}

describe('Chat + Message API', () => {
  it('opens a private chat and exchanges a message', async () => {
    const alice = await makeUser('a');
    const bob = await makeUser('b');

    const chatRes = await request(app)
      .post('/api/v1/chats/private')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: bob.id });
    expect(chatRes.status).toBe(201);
    const chatId = chatRes.body.data.chat._id as string;

    const sent = await request(app)
      .post(`/api/v1/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ type: 'text', text: 'Hello Bob' });
    expect(sent.status).toBe(201);
    expect(sent.body.data.message.text).toBe('Hello Bob');

    const list = await request(app)
      .get(`/api/v1/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${bob.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.messages).toHaveLength(1);
  });

  it('forbids non-members from reading a chat', async () => {
    const alice = await makeUser('a');
    const bob = await makeUser('b');
    const mallory = await makeUser('m');

    const chatRes = await request(app)
      .post('/api/v1/chats/private')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: bob.id });
    const chatId = chatRes.body.data.chat._id as string;

    const res = await request(app)
      .get(`/api/v1/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${mallory.token}`);
    expect(res.status).toBe(403);
  });

  it('edits and deletes a message for everyone', async () => {
    const alice = await makeUser('a');
    const bob = await makeUser('b');
    const chatRes = await request(app)
      .post('/api/v1/chats/private')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ userId: bob.id });
    const chatId = chatRes.body.data.chat._id as string;

    const sent = await request(app)
      .post(`/api/v1/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ text: 'typo' });
    const msgId = sent.body.data.message._id as string;

    const edited = await request(app)
      .patch(`/api/v1/messages/${msgId}`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ text: 'fixed' });
    expect(edited.status).toBe(200);
    expect(edited.body.data.message.text).toBe('fixed');
    expect(edited.body.data.message.isEdited).toBe(true);

    const del = await request(app)
      .delete(`/api/v1/messages/${msgId}`)
      .set('Authorization', `Bearer ${alice.token}`);
    expect(del.status).toBe(204);
  });
});
