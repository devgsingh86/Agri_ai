import { test } from 'node:test';
import assert from 'node:assert';
import { loginLocal, getProfile } from '../controllers/authController.js';

/**
 * Test loginLocal with invalid credentials
 */
test('loginLocal - invalid email', () => {
  const req = {
    body: {
      email: 'nonexistent@example.com',
      password: 'password123',
    },
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    },
  };

  loginLocal(req, res);

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.jsonData.success, false);
});

/**
 * Test loginLocal with missing credentials
 */
test('loginLocal - missing email and password', () => {
  const req = {
    body: {
      email: '',
      password: '',
    },
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    },
  };

  loginLocal(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.jsonData.success, false);
});

/**
 * Test getProfile without token
 */
test('getProfile - no user in request', () => {
  const req = {
    user: undefined,
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    },
  };

  getProfile(req, res);

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.jsonData.success, false);
});
