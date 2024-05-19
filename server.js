// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/aucsol', { useNewUrlParser: true, useUnifiedTopology: true });

const auctionSchema = new mongoose.Schema({
  title: String,
  description: String,
  startingBid: Number,
  bids: [{ amount: Number, bidder: String }],
});

const Auction = mongoose.model('Auction', auctionSchema);

app.get('/api/auctions', async (req, res) => {
  const auctions = await Auction.find();
  res.json(auctions);
});

app.post('/api/auctions', async (req, res) => {
  const auction = new Auction(req.body);
  await auction.save();
  res.status(201).json(auction);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
