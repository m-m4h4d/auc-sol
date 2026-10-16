import React, { useEffect, useRef, useState } from 'react';
import Paddle from '../Paddle/Paddle';
import { HOUR, formatClock, formatMoney } from '../../utils';
import './PriceBoard.css';

// The dark board showing an auction's price and countdown, like the display
// in an auction room. Children render below it (bid form, links, etc.).
const PriceBoard = ({ auction, now, heading, children }) => {
  const ended = auction.endsAt <= now;
  const price = auction.currentBid ?? auction.startingBid;

  // Flash the price whenever it changes, e.g. when a new bid comes in.
  const previousPrice = useRef(price);
  const [flashes, setFlashes] = useState(0);
  useEffect(() => {
    if (previousPrice.current !== price) setFlashes((n) => n + 1);
    previousPrice.current = price;
  }, [price]);

  let status;
  if (!ended) status = auction.bidCount === 0 ? 'Starting bid' : 'Current bid';
  else status = auction.bidCount === 0 ? 'Ended with no bids' : 'Sold for';

  return (
    <section className={`price-board on-dark ${ended ? 'is-ended' : ''}`} aria-live="polite">
      {heading}
      <p className="board-status">{status}</p>
      <p key={flashes} className={`board-price ${flashes ? 'flash' : ''}`}>
        {ended && auction.bidCount === 0 ? formatMoney(auction.startingBid) : formatMoney(price)}
      </p>

      <dl className="board-facts">
        <div>
          <dt>{ended ? 'Ended' : 'Time left'}</dt>
          <dd className={!ended && auction.endsAt - now < HOUR ? 'is-urgent' : ''}>
            {ended ? new Date(auction.endsAt).toLocaleDateString() : formatClock(auction.endsAt, now)}
          </dd>
        </div>
        <div>
          <dt>Bids</dt>
          <dd>{auction.bidCount}</dd>
        </div>
        {auction.highBidder && (
          <div>
            <dt>{ended ? 'Winner' : 'Leading'}</dt>
            <dd className="board-bidder">
              <Paddle username={auction.highBidder} />
              {auction.highBidder}
            </dd>
          </div>
        )}
      </dl>

      {children && <div className="board-actions">{children}</div>}
    </section>
  );
};

export default PriceBoard;
