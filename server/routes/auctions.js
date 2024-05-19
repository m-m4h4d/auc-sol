const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');  // Adjust the path based on your project structure

// Get all auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Create a new auction
router.post('/', async (req, res) => {
  try {
    const auction = new Auction(req.body);
    await auction.save();
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

module.exports = router;
