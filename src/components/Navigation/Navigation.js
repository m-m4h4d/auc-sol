import React from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { useAuth } from '../../auth';
import Paddle from '../Paddle/Paddle';
import './Navigation.css';

const Navigation = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  return (
    <header className="navigation">
      <div className="navigation-inner">
        <Link to="/" className="wordmark">
          <Paddle number="A" label="AucSol home" />
          AucSol
        </Link>

        <nav className="navigation-links" aria-label="Main">
          <NavLink to="/auctions">Auctions</NavLink>
          {user && <NavLink to="/create-auction">Sell an item</NavLink>}
        </nav>

        <div className="navigation-account">
          {user ? (
            <>
              <span className="navigation-user">
                <Paddle username={user} label={`Your paddle number`} />
                {user}
              </span>
              <button type="button" className="text-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
