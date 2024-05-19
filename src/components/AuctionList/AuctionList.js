import React, { useEffect, useState } from 'react';
import './AuctionList.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    axios.get('/api/auctions')
      .then(response => setAuctions(response.data))
      .catch(error => console.error('Error fetching auctions:', error));
  }, []);

  return (
    <div className="auction-list">
      <h1>Auctions</h1>
      <ul>
        {auctions.map(auction => (
          <li key={auction._id}>
            <Link to={`/auction/${auction._id}`}>{auction.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuctionList;
