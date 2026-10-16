const { route, requireUser } = require('../../_lib/http');
const { placeBid } = require('../../_lib/auctions');

module.exports = route({
  POST: async (req, res) => {
    const bidder = requireUser(req);
    res.json(await placeBid(req.query.id, req.body, bidder));
  },
});
