const { route } = require('../_lib/http');
const { login } = require('../_lib/users');

module.exports = route({
  POST: async (req, res) => {
    res.json(await login(req.body));
  },
});
