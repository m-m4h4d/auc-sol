import React from 'react';
import { paddleNumber } from '../../utils';
import './Paddle.css';

// A bidder paddle showing the user's paddle number.
const Paddle = ({ username, number, size = 'small', label }) => (
  <span className={`paddle paddle-${size}`} aria-label={label}>
    <span className="paddle-head">{number ?? paddleNumber(username)}</span>
  </span>
);

export default Paddle;
