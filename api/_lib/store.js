// Data storage. Uses Upstash Redis when its env vars are present (add it from
// the Vercel Marketplace and they are injected automatically), otherwise falls
// back to an in-memory store that is fine for local development but loses
// everything on restart.
const crypto = require('crypto');

const newId = () => crypto.randomBytes(8).toString('hex');

// Bid rules shared by both stores. Returns an error code or null.
function checkBid(auction, bid) {
  if (bid.time >= auction.endsAt) return 'ended';
  if (bid.bidder === auction.seller) return 'own_auction';
  if (auction.bidCount === 0 ? bid.amount < auction.startingBid : bid.amount <= auction.currentBid) {
    return 'too_low';
  }
  return null;
}

function createMemoryStore() {
  const users = new Map();
  const auctions = new Map();
  const bids = new Map();

  return {
    kind: 'memory',

    async getUser(username) {
      return users.get(username) || null;
    },

    async createUser(user) {
      if (users.has(user.username)) return false;
      users.set(user.username, { ...user });
      return true;
    },

    async createAuction(data) {
      const auction = { ...data, id: newId(), currentBid: null, highBidder: null, bidCount: 0 };
      auctions.set(auction.id, auction);
      bids.set(auction.id, []);
      return { ...auction };
    },

    async listAuctions() {
      return [...auctions.values()]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((a) => ({ ...a }));
    },

    async getAuction(id) {
      const auction = auctions.get(id);
      return auction ? { ...auction, bids: [...bids.get(id)].reverse() } : null;
    },

    async placeBid(id, bid) {
      const auction = auctions.get(id);
      if (!auction) return 'not_found';
      const error = checkBid(auction, bid);
      if (error) return error;
      auction.currentBid = bid.amount;
      auction.highBidder = bid.bidder;
      auction.bidCount += 1;
      bids.get(id).push(bid);
      return null;
    },
  };
}

// Atomically validates and records a bid so two simultaneous bids can't both win.
// KEYS[1] = auction hash, KEYS[2] = bids list
// ARGV = amount, bidder, time, bid JSON
const PLACE_BID_SCRIPT = `
local a = redis.call('HMGET', KEYS[1], 'endsAt', 'startingBid', 'currentBid', 'seller', 'bidCount')
if not a[1] then return 'not_found' end
local amount = tonumber(ARGV[1])
if tonumber(ARGV[3]) >= tonumber(a[1]) then return 'ended' end
if ARGV[2] == a[4] then return 'own_auction' end
if tonumber(a[5]) == 0 then
  if amount < tonumber(a[2]) then return 'too_low' end
elseif amount <= tonumber(a[3]) then
  return 'too_low'
end
redis.call('HSET', KEYS[1], 'currentBid', ARGV[1], 'highBidder', ARGV[2])
redis.call('HINCRBY', KEYS[1], 'bidCount', 1)
redis.call('RPUSH', KEYS[2], ARGV[4])
return 'ok'
`;

function createRedisStore(url, token) {
  const { Redis } = require('@upstash/redis');
  // Keep values as raw strings so titles like "123" aren't turned into numbers.
  const redis = new Redis({ url, token, automaticDeserialization: false });

  // With deserialization off, HGETALL returns a flat [field, value, ...] array.
  const toHash = (flat) => {
    if (!flat || flat.length === 0) return null;
    const hash = {};
    for (let i = 0; i < flat.length; i += 2) hash[flat[i]] = flat[i + 1];
    return hash;
  };

  const parseAuction = (id, h) => ({
    id,
    title: h.title,
    description: h.description,
    seller: h.seller,
    startingBid: Number(h.startingBid),
    currentBid: h.currentBid ? Number(h.currentBid) : null,
    highBidder: h.highBidder || null,
    bidCount: Number(h.bidCount),
    createdAt: Number(h.createdAt),
    endsAt: Number(h.endsAt),
  });

  return {
    kind: 'redis',

    async getUser(username) {
      const raw = await redis.get(`user:${username}`);
      return raw ? JSON.parse(raw) : null;
    },

    async createUser(user) {
      const result = await redis.set(`user:${user.username}`, JSON.stringify(user), { nx: true });
      return result === 'OK';
    },

    async createAuction(data) {
      const id = newId();
      await redis.hset(`auction:${id}`, {
        title: data.title,
        description: data.description,
        seller: data.seller,
        startingBid: String(data.startingBid),
        bidCount: '0',
        createdAt: String(data.createdAt),
        endsAt: String(data.endsAt),
      });
      await redis.zadd('auctions', { score: data.createdAt, member: id });
      return { ...data, id, currentBid: null, highBidder: null, bidCount: 0 };
    },

    async listAuctions() {
      const ids = await redis.zrange('auctions', 0, -1, { rev: true });
      if (ids.length === 0) return [];
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.hgetall(`auction:${id}`));
      const hashes = await pipeline.exec();
      return ids
        .map((id, i) => {
          const hash = toHash(hashes[i]);
          return hash ? parseAuction(id, hash) : null;
        })
        .filter(Boolean);
    },

    async getAuction(id) {
      const hash = toHash(await redis.hgetall(`auction:${id}`));
      if (!hash) return null;
      const bids = await redis.lrange(`auction:${id}:bids`, 0, -1);
      return { ...parseAuction(id, hash), bids: bids.map((b) => JSON.parse(b)).reverse() };
    },

    async placeBid(id, bid) {
      const result = await redis.eval(
        PLACE_BID_SCRIPT,
        [`auction:${id}`, `auction:${id}:bids`],
        [String(bid.amount), bid.bidder, String(bid.time), JSON.stringify(bid)]
      );
      return result === 'ok' ? null : result;
    },
  };
}

let store;

function getStore() {
  if (!store) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    store = url && token ? createRedisStore(url, token) : createMemoryStore();
  }
  return store;
}

module.exports = { getStore };
