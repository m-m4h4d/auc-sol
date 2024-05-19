import React, { useState } from 'react';
import Navigation from '../Navigation/Navigation';
import './CreateAuction.css';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auctions', { title, description, startingBid });
      history.push('/auctions');
    } catch (error) {
      console.error('Error creating auction:', error);
    }
  };

  return (
    <div className="create-auction">
      <Navigation />
      <h2>Create Auction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Starting Bid"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateAuction;
