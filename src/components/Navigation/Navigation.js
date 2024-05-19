import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="navigation">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/auctions">Auctions</Link></li>
        <li><Link to="/create-auction">Create Auction</Link></li>
      </ul>
    </nav>
  );
};

export default Navigation;
