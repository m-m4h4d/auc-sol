const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Get all auctions
app.get('/api/auctions', async (req, res) => {
  try {
    const auctionsRef = db.collection('auctions');
    const snapshot = await auctionsRef.get();
    const auctions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Create a new auction
app.post('/api/auctions', async (req, res) => {
  try {
    const newAuction = req.body;
    const auctionRef = await db.collection('auctions').add(newAuction);
    const auction = await auctionRef.get();
    res.status(201).json({ id: auction.id, ...auction.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// Expose the Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);
