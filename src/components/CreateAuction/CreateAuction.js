import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../auth';
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
  const { request } = useAuth();
  const history = useHistory();

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

  return (
    <div className="create-auction">
      <h2>Create Auction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          required
          maxLength={5000}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Starting Bid ($)"
          required
          min="0.01"
          step="0.01"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
        />
        <label>
          Duration
          <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))}>
            {DURATIONS.map((d) => (
              <option key={d.hours} value={d.hours}>{d.label}</option>
            ))}
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
      </form>
    </div>
  );
};

export default CreateAuction;
