import React from 'react';
import { Link } from 'react-router-dom';
import { HOUR, formatMoney, formatTimeLeft } from '../../utils';
import './LotRow.css';

// One auction in a list. Pass `preview` to render it without a link.
const LotRow = ({ auction, now, preview }) => {
  const ended = auction.endsAt <= now;
  const urgent = !ended && auction.endsAt - now < HOUR;
  const price = auction.currentBid ?? auction.startingBid;
  const Wrapper = preview ? 'div' : Link;
  const wrapperProps = preview ? {} : { to: `/auction/${auction.id}` };

  let priceNote;
  if (ended) priceNote = auction.bidCount === 0 ? 'No bids' : 'Sold';
  else priceNote = auction.bidCount === 0 ? 'Starting bid' : `${auction.bidCount} ${auction.bidCount === 1 ? 'bid' : 'bids'}`;

  return (
    <Wrapper className={`lot-row ${ended ? 'is-ended' : ''}`} {...wrapperProps}>
      <div className="lot-main">
        <span className="lot-title">{auction.title || 'Your item title'}</span>
        <span className="lot-seller">by {auction.seller}</span>
      </div>
      <div className="lot-numbers">
        <span className="lot-price">{formatMoney(price || 0)}</span>
        <span className="lot-note">
          {priceNote}
          <span className={`lot-time ${urgent ? 'is-urgent' : ''}`}>{formatTimeLeft(auction.endsAt, now)}</span>
        </span>
      </div>
    </Wrapper>
  );
};

export default LotRow;
