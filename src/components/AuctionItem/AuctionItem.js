import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../auth';
import { formatMoney, formatTimeLeft, useNow } from '../../utils';
import './AuctionItem.css';

const REFRESH_MS = 15000;

const AuctionItem = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, request } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [bid, setBid] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidding, setBidding] = useState(false);
  const now = useNow();

  const load = useCallback(() => {
    request(`/auctions/${id}`)
      .then((data) => {
        setAuction(data);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err.message));
  }, [id, request]);

  // Fetch now, then keep refreshing so other people's bids show up.
  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (!auction) {
    return <div className={`page ${loadError ? 'error' : ''}`}>{loadError || 'Loading...'}</div>;
  }

  const ended = auction.endsAt <= now;
  const minimumBid = auction.bidCount === 0 ? auction.startingBid : auction.currentBid + 0.01;

  const handleBid = async (e) => {
    e.preventDefault();
    setBidError('');
    setBidding(true);
    try {
      setAuction(await request(`/auctions/${id}/bid`, { method: 'POST', body: { amount: Number(bid) } }));
      setBid('');
    } catch (err) {
      setBidError(err.message);
      load();
    } finally {
      setBidding(false);
    }
  };

  let bidSection;
  if (ended) {
    bidSection = (
      <p className="notice">
        {auction.highBidder
          ? `Won by ${auction.highBidder} for ${formatMoney(auction.currentBid)}.`
          : 'Ended with no bids.'}
      </p>
    );
  } else if (!user) {
    bidSection = (
      <p className="notice">
        <Link to={{ pathname: '/login', state: { from: location.pathname } }}>Log in</Link> to place a bid.
      </p>
    );
  } else if (user === auction.seller) {
    bidSection = <p className="notice">This is your auction.</p>;
  } else {
    bidSection = (
      <form onSubmit={handleBid}>
        <input
          type="number"
          step="0.01"
          min={minimumBid.toFixed(2)}
          required
          placeholder={`${formatMoney(minimumBid)} or more`}
          value={bid}
          onChange={(e) => setBid(e.target.value)}
        />
        <button type="submit" disabled={bidding}>{bidding ? 'Placing…' : 'Place Bid'}</button>
        {auction.highBidder === user && <p className="notice">You're the highest bidder.</p>}
        {bidError && <p className="error">{bidError}</p>}
      </form>
    );
  }

  return (
    <div className="auction-item page">
      <h1>{auction.title}</h1>
      <p className="auction-seller">Sold by {auction.seller}</p>
      <p className="auction-description">{auction.description}</p>

      <div className="auction-stats">
        <div>
          <span>{auction.bidCount === 0 ? 'Starting bid' : 'Current bid'}</span>
          <strong>{formatMoney(auction.currentBid ?? auction.startingBid)}</strong>
        </div>
        <div>
          <span>{ended ? 'Ended' : 'Time left'}</span>
          <strong title={new Date(auction.endsAt).toLocaleString()}>
            {ended ? new Date(auction.endsAt).toLocaleString() : formatTimeLeft(auction.endsAt, now).replace(' left', '')}
          </strong>
        </div>
      </div>

      {bidSection}

      <h2>Bid history</h2>
      {auction.bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        <ul>
          {auction.bids.map((b) => (
            <li key={`${b.time}-${b.bidder}`}>
              <strong>{formatMoney(b.amount)}</strong> by {b.bidder}
              <span className="bid-time">{new Date(b.time).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuctionItem;
