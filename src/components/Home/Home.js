import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1>Welcome to AucSol</h1>
      <p>Your online auction solution.</p>
      <div className="home-actions">
        <Link className="button" to="/auctions">Browse auctions</Link>
        <Link className="button button-secondary" to={user ? '/create-auction' : '/register'}>
          {user ? 'Sell something' : 'Create an account'}
        </Link>
      </div>
    </div>
  );
};

export default Home;
