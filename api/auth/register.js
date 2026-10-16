const { route } = require('../_lib/http');
const { register } = require('../_lib/users');

module.exports = route({
  POST: async (req, res) => {
    res.status(201).json(await register(req.body));
  },
});
