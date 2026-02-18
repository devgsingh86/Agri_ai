import bcrypt from 'bcryptjs';

/**
 * In-memory user store for local development
 */
export const users = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: bcrypt.hashSync('password123', 10),
    provider: 'local',
    picture: null,
    createdAt: new Date(),
  },
];

/**
 * Add a new user to the store
 */
export const addUser = (user) => {
  users.push(user);
};

/**
 * Find user by email
 */
export const findUserByEmail = (email) => {
  return users.find((u) => u.email === email);
};

/**
 * Find user by id
 */
export const findUserById = (id) => {
  return users.find((u) => u.id === id);
};
