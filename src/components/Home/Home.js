import React from 'react';
import Navigation from '../Navigation/Navigation';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Navigation />
      <h1>Welcome to AucSol</h1>
      <p>Your online auction solution.</p>
    </div>
  );
};

export default Home;
