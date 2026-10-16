import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Redirect, Route, Switch } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { api } from './api';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import AuctionList from './components/AuctionList/AuctionList';
import AuctionItem from './components/AuctionItem/AuctionItem';
import CreateAuction from './components/CreateAuction/CreateAuction';

// Warns when the deployment is missing configuration, so lost data isn't a surprise.
const SetupBanner = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api('/health').then(setHealth).catch(() => {});
  }, []);

  if (!health) return null;
  if (!health.authConfigured) {
    return <div className="banner banner-error">Setup needed: set the JWT_SECRET environment variable.</div>;
  }
  if (health.storage === 'memory') {
    return (
      <div className="banner">
        Demo mode: data is kept in memory and will be lost. Connect Upstash Redis to keep it.
      </div>
    );
  }
  return null;
};

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) =>
        user ? <Component {...props} /> : <Redirect to={{ pathname: '/login', state: { from: props.location.pathname } }} />
      }
    />
  );
};

const NotFound = () => (
  <div className="page page-narrow">
    <div className="empty-state">
      <p>There's no page at this address.</p>
      <Link to="/auctions" className="btn btn-primary">Browse auctions</Link>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <SetupBanner />
        <Navigation />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/auctions" component={AuctionList} />
          <Route path="/auction/:id" component={AuctionItem} />
          <PrivateRoute path="/create-auction" component={CreateAuction} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
