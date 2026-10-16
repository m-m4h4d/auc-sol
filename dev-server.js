// Runs the functions in api/ locally with Express, mirroring Vercel's routing.
// `npm run dev` starts this alongside the React dev server, which proxies /api
// requests here (see "proxy" in package.json).
const express = require('express');

const routes = [
  ['/api/health', require('./api/health')],
  ['/api/auth/register', require('./api/auth/register')],
  ['/api/auth/login', require('./api/auth/login')],
  ['/api/auctions', require('./api/auctions')],
  ['/api/auctions/:id', require('./api/auctions/[id]')],
  ['/api/auctions/:id/bid', require('./api/auctions/[id]/bid')],
];

function createApp() {
  const app = express();
  app.use(express.json());
  for (const [path, handler] of routes) {
    app.all(path, (req, res) => {
      Object.assign(req.query, req.params);
      return handler(req, res);
    });
  }
  return app;
}

if (require.main === module) {
  const port = process.env.API_PORT || 3001;
  createApp().listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = { createApp };
