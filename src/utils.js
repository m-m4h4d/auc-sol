import { useEffect, useState } from 'react';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (amount) => money.format(amount);

export const HOUR = 60 * 60 * 1000;

export function formatTimeLeft(endsAt, now) {
  const ms = endsAt - now;
  if (ms <= 0) return 'Ended';
  const minutes = Math.floor(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes % 60}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return `${Math.floor(ms / 1000)}s left`;
}

// Clock-style countdown for the price board, e.g. "2d 04:12:09" or "04:12:09".
export function formatClock(endsAt, now) {
  const total = Math.max(0, Math.floor((endsAt - now) / 1000));
  const days = Math.floor(total / 86400);
  const pad = (n) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

export function formatBidTime(time, now) {
  const minutes = Math.floor((now - time) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Every user gets a stable paddle number (100-999) derived from their username.
export function paddleNumber(username = '') {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 100 + (hash % 900);
}

export const minimumBid = (auction) =>
  auction.bidCount === 0 ? auction.startingBid : Math.round((auction.currentBid + 0.01) * 100) / 100;

// Suggested bids in round steps that scale with the price.
export function suggestedBids(auction) {
  const base = auction.currentBid ?? auction.startingBid;
  const step = base < 20 ? 1 : base < 100 ? 5 : base < 1000 ? 10 : 50;
  const first = auction.bidCount === 0 ? auction.startingBid : Math.floor(base / step) * step + step;
  return [first, first + step, first + step * 2];
}

// Current time, refreshed on an interval so countdowns stay live.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
