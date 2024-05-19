// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AuctionList from './components/AuctionList';
import AuctionItem from './components/AuctionItem';
import CreateAuction from './components/CreateAuction';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/auctions" component={AuctionList} />
          <Route path="/auction/:id" component={AuctionItem} />
          <Route path="/create-auction" component={CreateAuction} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
