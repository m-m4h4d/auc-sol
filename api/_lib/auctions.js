const { getStore } = require('./store');
const { HttpError } = require('./http');

const MAX_DURATION_HOURS = 24 * 30;

// Rounds to cents and rejects anything that isn't a positive amount.
function parseAmount(value, label) {
  const amount = Math.round(Number(value) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, `${label} must be a positive number.`);
  if (amount > 1e9) throw new HttpError(400, `${label} is too large.`);
  return amount;
}

async function createAuction(body, seller) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  if (!title || title.length > 120) throw new HttpError(400, 'Title is required (max 120 characters).');
  if (!description || description.length > 5000) {
    throw new HttpError(400, 'Description is required (max 5000 characters).');
  }
  const startingBid = parseAmount(body.startingBid, 'Starting bid');
  const durationHours = Number(body.durationHours);
  if (!Number.isFinite(durationHours) || durationHours <= 0 || durationHours > MAX_DURATION_HOURS) {
    throw new HttpError(400, 'Duration must be between 1 hour and 30 days.');
  }

  const now = Date.now();
  return getStore().createAuction({
    title,
    description,
    seller,
    startingBid,
    createdAt: now,
    endsAt: now + Math.round(durationHours * 60 * 60 * 1000),
  });
}

async function getAuction(id) {
  const auction = await getStore().getAuction(String(id));
  if (!auction) throw new HttpError(404, 'Auction not found.');
  return auction;
}

const BID_ERRORS = {
  not_found: [404, 'Auction not found.'],
  ended: [400, 'This auction has ended.'],
  own_auction: [400, "You can't bid on your own auction."],
  too_low: [400, 'Your bid is too low. Someone may have just outbid you.'],
};

async function placeBid(id, body, bidder) {
  const amount = parseAmount(body?.amount, 'Bid');
  const error = await getStore().placeBid(String(id), { amount, bidder, time: Date.now() });
  if (error) {
    const [status, message] = BID_ERRORS[error] || [500, 'Could not place bid.'];
    throw new HttpError(status, message);
  }
  return getAuction(id);
}

module.exports = { createAuction, getAuction, placeBid };
