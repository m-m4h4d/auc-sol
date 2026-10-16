const { getStore } = require('./_lib/store');
const { route } = require('./_lib/http');

// Lets the front end warn when the deployment isn't fully configured.
module.exports = route({
  GET: (req, res) => {
    res.json({
      storage: getStore().kind,
      authConfigured: Boolean(process.env.JWT_SECRET) || process.env.NODE_ENV !== 'production',
    });
  },
});
