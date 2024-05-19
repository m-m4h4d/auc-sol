// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
