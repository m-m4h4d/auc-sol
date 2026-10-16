// Forwards /api requests from the React dev server to the local API server
// (dev-server.js). Only used by `npm start`; on Vercel /api is served directly.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({ target: `http://localhost:${process.env.API_PORT || 3001}` })
  );
};
