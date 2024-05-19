// src/components/AuctionList.js
import React, { useEffect, useState } from 'react';
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
    <div>
      <h1>Auctions</h1>
      <ul>
        {auctions.map(auction => (
          <li key={auction.id}>
            <Link to={`/auction/${auction.id}`}>{auction.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuctionList;
