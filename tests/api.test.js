// End-to-end tests for the API against the in-memory store.
// Run with `npm run test:api`.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../dev-server');

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

const register = async (username) =>
  (await call('POST', '/api/auth/register', { username, password: 'secret123' })).body.token;

test('register, log in and reject bad credentials', async () => {
  const created = await call('POST', '/api/auth/register', { username: 'Alice', password: 'secret123' });
  assert.strictEqual(created.status, 201);
  assert.strictEqual(created.body.username, 'alice');

  const duplicate = await call('POST', '/api/auth/register', { username: 'alice', password: 'secret123' });
  assert.strictEqual(duplicate.status, 409);

  const ok = await call('POST', '/api/auth/login', { username: 'alice', password: 'secret123' });
  assert.strictEqual(ok.status, 200);
  assert.ok(ok.body.token);

  const bad = await call('POST', '/api/auth/login', { username: 'alice', password: 'wrong' });
  assert.strictEqual(bad.status, 401);
});

test('creating an auction requires login and valid input', async () => {
  const anonymous = await call('POST', '/api/auctions', { title: 'x' });
  assert.strictEqual(anonymous.status, 401);

  const token = await register('seller1');
  const invalid = await call('POST', '/api/auctions', { title: '', description: 'd', startingBid: 5, durationHours: 1 }, token);
  assert.strictEqual(invalid.status, 400);
});

test('full auction and bidding flow', async () => {
  const seller = await register('seller2');
  const bob = await register('bob');
  const carol = await register('carol');

  const created = await call(
    'POST',
    '/api/auctions',
    { title: 'Vintage lamp', description: 'Works great', startingBid: 10, durationHours: 24 },
    seller
  );
  assert.strictEqual(created.status, 201);
  const { id } = created.body;

  const list = await call('GET', '/api/auctions');
  assert.ok(list.body.some((a) => a.id === id));

  assert.strictEqual((await call('POST', `/api/auctions/${id}/bid`, { amount: 10 })).status, 401);
  assert.strictEqual((await call('POST', `/api/auctions/${id}/bid`, { amount: 20 }, seller)).status, 400);
  assert.strictEqual((await call('POST', `/api/auctions/${id}/bid`, { amount: 9.99 }, bob)).status, 400);

  // The first bid may equal the starting price.
  const first = await call('POST', `/api/auctions/${id}/bid`, { amount: 10 }, bob);
  assert.strictEqual(first.status, 200);
  assert.strictEqual(first.body.currentBid, 10);

  // Later bids must beat the current price.
  assert.strictEqual((await call('POST', `/api/auctions/${id}/bid`, { amount: 10 }, carol)).status, 400);
  const second = await call('POST', `/api/auctions/${id}/bid`, { amount: '12.5' }, carol);
  assert.strictEqual(second.status, 200);

  const detail = await call('GET', `/api/auctions/${id}`);
  assert.strictEqual(detail.body.currentBid, 12.5);
  assert.strictEqual(detail.body.highBidder, 'carol');
  assert.strictEqual(detail.body.bidCount, 2);
  assert.deepStrictEqual(detail.body.bids.map((b) => b.bidder), ['carol', 'bob']);
});

test('unknown auctions return 404', async () => {
  assert.strictEqual((await call('GET', '/api/auctions/nope')).status, 404);
  const token = await register('dave');
  assert.strictEqual((await call('POST', '/api/auctions/nope/bid', { amount: 5 }, token)).status, 404);
});

test('unsupported methods return 405', async () => {
  assert.strictEqual((await call('DELETE', '/api/auctions')).status, 405);
});
