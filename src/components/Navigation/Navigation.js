import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../../auth';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  return (
    <nav className="navigation">
      <ul>
        <li><NavLink to="/" exact>Home</NavLink></li>
        <li><NavLink to="/auctions">Auctions</NavLink></li>
        {user && <li><NavLink to="/create-auction">Create Auction</NavLink></li>}
      </ul>
      <ul>
        {user ? (
          <>
            <li className="navigation-user">Hi, {user}</li>
            <li><button type="button" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register">Register</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
