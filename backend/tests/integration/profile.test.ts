import request from 'supertest';
import { createApp } from '../../src/app';
import { initDatabase, closeDatabase, getDb } from '../../src/config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';
import { v4 as uuidv4 } from 'uuid';

const app = createApp();

function makeToken(userId: string, email = 'test@example.com'): string {
  return jwt.sign({ sub: userId, email }, env.jwt.secret, { expiresIn: '1h' });
}

describe('Profile Integration Tests', () => {
  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    initDatabase();
    userId = uuidv4();
    authToken = makeToken(userId);

    // Insert test user
    const db = getDb();
    await db('users').insert({
      id: userId,
      email: 'profile-test@example.com',
      password_hash: 'hashed',
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  afterAll(async () => {
    const db = getDb();
    await db('farm_crops').where('farm_profile_id',
      db('farm_profiles').select('id').where('user_id', userId)
    ).delete();
    await db('farm_profiles').where('user_id', userId).delete();
    await db('onboarding_progress').where('user_id', userId).delete();
    await db('users').where('id', userId).delete();
    await closeDatabase();
  });

  const validProfile = {
    first_name: 'John',
    last_name: 'Doe',
    farm_size: 5,
    farm_size_unit: 'hectares',
    location_type: 'manual',
    country: 'India',
    state: 'Punjab',
    experience_level: 'beginner',
    crops: [{ crop_name: 'Wheat', is_custom: false }],
  };

  describe('POST /api/v1/profile', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/v1/profile').send(validProfile);
      expect(res.status).toBe(401);
    });

    it('returns 422 with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ first_name: 'John' });
      expect(res.status).toBe(422);
    });

    it('creates profile successfully', async () => {
      const res = await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProfile);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        user_id: userId,
        first_name: 'John',
        last_name: 'Doe',
        farm_size_unit: 'hectares',
      });
      expect(res.body.data.crops).toHaveLength(1);
      expect(res.body.data.completeness).toBeGreaterThanOrEqual(50);
    });

    it('returns 409 when profile already exists', async () => {
      const res = await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validProfile);
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/profile', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/profile');
      expect(res.status).toBe(401);
    });

    it('returns existing profile', async () => {
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.first_name).toBe('John');
    });

    it('returns 404 for user with no profile', async () => {
      const newToken = makeToken(uuidv4(), 'noone@example.com');
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${newToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/profile', () => {
    it('partially updates profile', async () => {
      const res = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ first_name: 'Jane', phone_number: '+919876543210' });

      expect(res.status).toBe(200);
      expect(res.body.data.first_name).toBe('Jane');
    });

    it('returns 422 with empty body', async () => {
      const res = await request(app)
        .patch('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/v1/profile', () => {
    it('soft deletes the profile', async () => {
      const res = await request(app)
        .delete('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 after deletion', async () => {
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });
});
