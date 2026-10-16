import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useNow } from '../../utils';
import LotRow from '../LotRow/LotRow';
import './AuctionList.css';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('live');
  const now = useNow(1000);

  useEffect(() => {
    api('/auctions')
      .then(setAuctions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Live auctions ending soonest first; ended ones most recent first.
  const live = auctions.filter((a) => a.endsAt > now).sort((a, b) => a.endsAt - b.endsAt);
  const ended = auctions.filter((a) => a.endsAt <= now).sort((a, b) => b.endsAt - a.endsAt);
  const shown = view === 'live' ? live : ended;

  let content;
  if (loading) content = <p className="list-status">Loading auctions…</p>;
  else if (error) content = <p className="error list-status">Couldn't load auctions: {error}</p>;
  else if (shown.length === 0) {
    content = (
      <div className="empty-state">
        <p>{view === 'live' ? 'No live auctions right now.' : 'No auctions have ended yet.'}</p>
        {view === 'live' && <Link to="/create-auction" className="btn btn-primary">List an item</Link>}
      </div>
    );
  } else {
    content = (
      <div className="lot-list">
        {shown.map((auction) => <LotRow key={auction.id} auction={auction} now={now} />)}
      </div>
    );
  }

  return (
    <div className="auction-list page page-narrow">
      <div className="page-header">
        <h1>Auctions</h1>
        <Link to="/create-auction" className="btn btn-primary">Sell an item</Link>
      </div>

      <div className="view-switch" role="group" aria-label="Show auctions">
        <button type="button" aria-pressed={view === 'live'} onClick={() => setView('live')}>
          Live <span>{live.length}</span>
        </button>
        <button type="button" aria-pressed={view === 'ended'} onClick={() => setView('ended')}>
          Ended <span>{ended.length}</span>
        </button>
      </div>

      {content}
    </div>
  );
};

export default AuctionList;
