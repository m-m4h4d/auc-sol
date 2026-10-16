import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { formatMoney, formatTimeLeft, useNow } from '../../utils';
import './AuctionList.css';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = useNow(30000);

  useEffect(() => {
    api('/auctions')
      .then(setAuctions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  // Live auctions first, soonest-ending at the top; ended ones after.
  const sorted = [...auctions].sort((a, b) => {
    const aEnded = a.endsAt <= now;
    const bEnded = b.endsAt <= now;
    if (aEnded !== bEnded) return aEnded ? 1 : -1;
    return aEnded ? b.endsAt - a.endsAt : a.endsAt - b.endsAt;
  });

  return (
    <div className="auction-list page">
      <h1>Auctions</h1>
      {sorted.length === 0 ? (
        <p>
          No auctions yet. <Link to="/create-auction">Create the first one</Link>.
        </p>
      ) : (
        <ul>
          {sorted.map((auction) => {
            const ended = auction.endsAt <= now;
            return (
              <li key={auction.id} className={ended ? 'ended' : ''}>
                <Link to={`/auction/${auction.id}`}>{auction.title}</Link>
                <div className="auction-meta">
                  <span>{formatMoney(auction.currentBid ?? auction.startingBid)}</span>
                  <span>{auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}</span>
                  <span>{formatTimeLeft(auction.endsAt, now)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AuctionList;
