import React, { useEffect, useState } from 'react';
import './AuctionItem.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AuctionItem = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bid, setBid] = useState('');

  useEffect(() => {
    axios.get(`/api/auctions/${id}`)
      .then(response => setAuction(response.data))
      .catch(error => console.error('Error fetching auction:', error));
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/auctions/${id}/bid`, { amount: bid });
      setAuction({ ...auction, bids: [...auction.bids, { amount: bid }] });
      setBid('');
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  if (!auction) return <div>Loading...</div>;

  return (
    <div className="auction-item">
      <h1>{auction.title}</h1>
      <p>{auction.description}</p>
      <h2>Starting Bid: ${auction.startingBid}</h2>
      <ul>
        {auction.bids.map((bid, index) => (
          <li key={index}>${bid.amount} by {bid.bidder}</li>
        ))}
      </ul>
      <form onSubmit={handleBid}>
        <input
          type="number"
          placeholder="Enter your bid"
          value={bid}
          onChange={(e) => setBid(e.target.value)}
        />
        <button type="submit">Place Bid</button>
      </form>
    </div>
  );
};

export default AuctionItem;
