import request from 'supertest';
import { createApp } from '../../src/app';
import { initDatabase, closeDatabase, getDb } from '../../src/config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { v4 as uuidv4 } from 'uuid';

const app = createApp();

function makeToken(userId: string): string {
  return jwt.sign({ sub: userId, email: `${userId}@test.com` }, env.jwt.secret, {
    expiresIn: '1h',
  });
}

describe('Onboarding Progress Integration Tests', () => {
  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    initDatabase();
    userId = uuidv4();
    authToken = makeToken(userId);

    const db = getDb();
    await db('users').insert({
      id: userId,
      email: `onboarding-${userId}@test.com`,
      password_hash: 'hashed',
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  afterAll(async () => {
    const db = getDb();
    await db('onboarding_progress').where('user_id', userId).delete();
    await db('users').where('id', userId).delete();
    await closeDatabase();
  });

  describe('GET /api/v1/profile/progress', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/profile/progress');
      expect(res.status).toBe(401);
    });

    it('returns default progress when none exists', async () => {
      const res = await request(app)
        .get('/api/v1/profile/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.current_step).toBe(1);
      expect(res.body.data.total_steps).toBe(5);
    });
  });

  describe('POST /api/v1/profile/progress', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/profile/progress')
        .send({ current_step: 2 });
      expect(res.status).toBe(401);
    });

    it('saves onboarding progress', async () => {
      const res = await request(app)
        .post('/api/v1/profile/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          current_step: 3,
          saved_data: { farm_size: 10, farm_size_unit: 'hectares' },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.current_step).toBe(3);
    });

    it('updates existing progress', async () => {
      const res = await request(app)
        .post('/api/v1/profile/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ current_step: 4 });

      expect(res.status).toBe(200);
      expect(res.body.data.current_step).toBe(4);
    });

    it('returns 422 for invalid step > 5', async () => {
      const res = await request(app)
        .post('/api/v1/profile/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ current_step: 6 });

      expect(res.status).toBe(422);
    });
  });
});
