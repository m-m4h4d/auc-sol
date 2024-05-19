/* eslint-disable no-unused-vars */
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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mahadbinashfaq:q0p2jIry3j016tyK@aucsol.mj7ttpx.mongodb.net/?retryWrites=true&w=majority&appName=AucSol";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
