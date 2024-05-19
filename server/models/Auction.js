const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startingBid: {
    type: Number,
    required: true
  },
  bids: [{
    amount: Number,
    bidder: String
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Auction', auctionSchema);
