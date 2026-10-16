import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../auth';
import { HOUR, useNow } from '../../utils';
import LotRow from '../LotRow/LotRow';
import './CreateAuction.css';

const DURATIONS = [
  { hours: 1, label: '1 hour' },
  { hours: 24, label: '1 day' },
  { hours: 72, label: '3 days' },
  { hours: 168, label: '7 days' },
];

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [durationHours, setDurationHours] = useState(24);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, request } = useAuth();
  const history = useHistory();
  const now = useNow(60000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const auction = await request('/auctions', {
        method: 'POST',
        body: { title, description, startingBid: Number(startingBid), durationHours },
      });
      history.push(`/auction/${auction.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const endsAt = now + durationHours * HOUR;
  const preview = {
    title: title.trim(),
    seller: user,
    startingBid: Number(startingBid) || 0,
    currentBid: null,
    bidCount: 0,
    endsAt,
  };

  return (
    <div className="create-auction page">
      <div className="page-header">
        <div>
          <h1>Sell an item</h1>
          <p className="lede">Set a starting price and how long bidding stays open. The highest bid when time runs out wins.</p>
        </div>
      </div>

      <div className="create-layout">
        <form className="create-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="input"
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Brass desk lamp, 1970s"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="input"
              required
              maxLength={5000}
              rows={6}
              placeholder="Condition, size, anything a bidder should know."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Starting bid</span>
            <span className="money-input">
              <input
                className="input"
                type="number"
                inputMode="decimal"
                required
                min="0.01"
                step="0.01"
                placeholder="10.00"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
              />
            </span>
            <span className="field-hint">The first bid has to be at least this much.</span>
          </label>
          <fieldset className="field duration-field">
            <legend className="field-label">Bidding stays open for</legend>
            <div className="duration-options">
              {DURATIONS.map((d) => (
                <label key={d.hours}>
                  <input
                    type="radio"
                    name="duration"
                    value={d.hours}
                    checked={durationHours === d.hours}
                    onChange={() => setDurationHours(d.hours)}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
            <span className="field-hint">
              Ends {new Date(endsAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}.
            </span>
          </fieldset>
          {error && <p className="error form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Listing item…' : 'List item'}
          </button>
        </form>

        <aside className="create-preview" aria-label="Preview">
          <p className="preview-label">How it will appear in the auction list</p>
          <div className="preview-card">
            <LotRow auction={preview} now={now} preview />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CreateAuction;
