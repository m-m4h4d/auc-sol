const { getStore } = require('../_lib/store');
const { route, requireUser } = require('../_lib/http');
const { createAuction } = require('../_lib/auctions');

module.exports = route({
  GET: async (req, res) => {
    res.json(await getStore().listAuctions());
  },
  POST: async (req, res) => {
    const seller = requireUser(req);
    res.status(201).json(await createAuction(req.body, seller));
  },
});
