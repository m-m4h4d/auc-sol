import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../auth';
import { formatBidTime, formatMoney, minimumBid, suggestedBids, useNow } from '../../utils';
import Paddle from '../Paddle/Paddle';
import PriceBoard from '../PriceBoard/PriceBoard';
import './AuctionItem.css';

const REFRESH_MS = 15000;

const BidForm = ({ auction, onBid }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [bidding, setBidding] = useState(false);
  const minimum = minimumBid(auction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBidding(true);
    try {
      await onBid(Number(amount));
      setAmount('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBidding(false);
    }
  };

  return (
    <form className="bid-form" onSubmit={handleSubmit}>
      <div className="bid-suggestions" role="group" aria-label="Suggested bids">
        {suggestedBids(auction).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={Number(amount) === value}
            onClick={() => setAmount(String(value))}
          >
            {formatMoney(value)}
          </button>
        ))}
      </div>
      <label className="bid-label" htmlFor="bid-amount">Your bid</label>
      <div className="bid-row">
        <div className="money-input">
          <input
            id="bid-amount"
            className="input"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={minimum.toFixed(2)}
            required
            placeholder={minimum.toFixed(2)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-paddle" disabled={bidding}>
          {bidding ? 'Placing bid…' : 'Place bid'}
        </button>
      </div>
      <p className="bid-hint">Enter {formatMoney(minimum)} or more.</p>
      {error && <p className="bid-error" role="alert">{error}</p>}
    </form>
  );
};

const AuctionItem = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, request } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loadError, setLoadError] = useState(null);
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
    return (
      <div className="page page-narrow">
        {loadError ? (
          <div className="empty-state">
            <p>{loadError}</p>
            <Link to="/auctions" className="btn btn-primary">Browse auctions</Link>
          </div>
        ) : (
          <p>Loading auction…</p>
        )}
      </div>
    );
  }

  const ended = auction.endsAt <= now;

  const placeBid = async (amount) => {
    try {
      setAuction(await request(`/auctions/${id}/bid`, { method: 'POST', body: { amount } }));
    } catch (err) {
      load();
      throw err;
    }
  };

  let action = null;
  if (ended) {
    action = null;
  } else if (!user) {
    action = (
      <>
        <Link to={{ pathname: '/login', state: { from: location.pathname } }} className="btn btn-paddle">
          Log in to bid
        </Link>
        <p className="board-note">
          New here? <Link to={{ pathname: '/register', state: { from: location.pathname } }}>Create an account</Link>
        </p>
      </>
    );
  } else if (user === auction.seller) {
    action = <p className="board-note">This is your listing, so you can't bid on it.</p>;
  } else {
    action = (
      <>
        {auction.highBidder === user && <p className="board-leading">You have the highest bid.</p>}
        <BidForm auction={auction} onBid={placeBid} />
      </>
    );
  }

  return (
    <div className="auction-item page">
      <Link to="/auctions" className="back-link">All auctions</Link>

      <div className="auction-layout">
        <header className="auction-head">
          <h1>{auction.title}</h1>
          <p className="auction-seller">
            <Paddle username={auction.seller} />
            Listed by {auction.seller}
          </p>
        </header>

        <div className="auction-body">
          <p className="auction-description">{auction.description}</p>

          <section className="bid-history" aria-labelledby="history-heading">
            <h2 id="history-heading">Bid history</h2>
            {auction.bids.length === 0 ? (
              <p className="history-empty">
                No bids yet. The first bid needs to be at least {formatMoney(auction.startingBid)}.
              </p>
            ) : (
              <ol>
                {auction.bids.map((b, index) => (
                  <li key={`${b.time}-${b.bidder}`} className={index === 0 ? 'is-top' : ''}>
                    <Paddle username={b.bidder} />
                    <span className="history-bidder">{b.bidder === user ? `${b.bidder} (you)` : b.bidder}</span>
                    <span className="history-amount">{formatMoney(b.amount)}</span>
                    <span className="history-time">{formatBidTime(b.time, now)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="auction-board">
          <PriceBoard auction={auction} now={now}>{action}</PriceBoard>
        </div>
      </div>
    </div>
  );
};

export default AuctionItem;
