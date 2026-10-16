const bcrypt = require('bcryptjs');
const { getStore } = require('./store');
const { HttpError, signToken } = require('./http');

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

function readCredentials(body) {
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!username || !password) throw new HttpError(400, 'Username and password are required.');
  return { username, password };
}

async function register(body) {
  const { username, password } = readCredentials(body);
  if (!USERNAME_PATTERN.test(username)) {
    throw new HttpError(400, 'Username must be 3-30 characters: letters, numbers or underscores.');
  }
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await getStore().createUser({ username, passwordHash, createdAt: Date.now() });
  if (!created) throw new HttpError(409, 'That username is already taken.');
  return { username, token: signToken(username) };
}

async function login(body) {
  const { username, password } = readCredentials(body);
  const user = await getStore().getUser(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid username or password.');
  }
  return { username, token: signToken(username) };
}

module.exports = { register, login };
