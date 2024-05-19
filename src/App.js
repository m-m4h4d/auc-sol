// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import AuctionList from './components/AuctionList/AuctionList';
import AuctionItem from './components/AuctionItem/AuctionItem';
import CreateAuction from './components/CreateAuction/CreateAuction';

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
