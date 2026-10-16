const { route } = require('../../_lib/http');
const { getAuction } = require('../../_lib/auctions');

module.exports = route({
  GET: async (req, res) => {
    res.json(await getAuction(req.query.id));
  },
});
