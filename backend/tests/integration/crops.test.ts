import request from 'supertest';
import { createApp } from '../../src/app';
import { initDatabase, closeDatabase } from '../../src/config/database';

const app = createApp();

describe('Crops Integration Tests', () => {
  beforeAll(async () => {
    initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/v1/crops', () => {
    it('returns 200 with a list of crops (public route)', async () => {
      const res = await request(app).get('/api/v1/crops');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns pagination metadata', async () => {
      const res = await request(app).get('/api/v1/crops?limit=5&offset=0');
      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject({
        limit: 5,
        offset: 0,
      });
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('filters crops by search term', async () => {
      const res = await request(app).get('/api/v1/crops?search=wheat');
      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        const names = res.body.data.map((c: { name: string }) => c.name.toLowerCase());
        expect(names.some((n: string) => n.includes('wheat'))).toBe(true);
      }
    });

    it('returns 422 for invalid limit > 100', async () => {
      const res = await request(app).get('/api/v1/crops?limit=999');
      expect(res.status).toBe(422);
    });

    it('returns empty array for non-matching search', async () => {
      const res = await request(app).get('/api/v1/crops?search=zzznomatchcropxxx');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
