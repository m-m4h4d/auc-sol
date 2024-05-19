import React, { useEffect, useState } from 'react';
import Navigation from '../Navigation/Navigation';
import './AuctionList.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('/api/auctions');
        setAuctions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="auction-list">
      <Navigation />
      <h1>Auctions</h1>
      {auctions.length === 0 ? (
        <p>No auctions available.</p>
      ) : (
        <ul>
          {auctions.map(auction => (
            <li key={auction._id}>
              <Link to={`/auction/${auction._id}`}>{auction.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuctionList;
