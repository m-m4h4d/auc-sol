# auc-sol

Web Engineering 4th Semester Project By Muhammad Mahad, Abdul Moiz, and Khawaja Hamza Siddique.

AucSol is an online auction app: register, list items with a starting price and
duration, and bid against other users until the auction ends.

## How it's built

- **Front end:** React (Create React App) in `src/`.
- **API:** Vercel serverless functions in `api/` (Node.js, no framework).
  - `POST /api/auth/register`, `POST /api/auth/login`: return a JWT
  - `GET /api/auctions`, `POST /api/auctions` (logged in)
  - `GET /api/auctions/:id`, `POST /api/auctions/:id/bid` (logged in)
  - `GET /api/health`: reports storage mode and config status
- **Storage:** [Upstash Redis](https://upstash.com/) when configured, otherwise
  an in-memory store (handy for local development; data is lost on restart).
  Bids are validated and recorded atomically, so two people can't both win
  with the same bid.

## Running locally

```bash
npm install
npm run dev
```

This starts the API on http://localhost:3001 and the React app on
http://localhost:3000, which forwards `/api` requests to the API. No setup or
environment variables are needed; data is kept in memory.

To use Redis locally, copy `.env.example` to `.env.local`, fill in the Upstash
values, and run `node --env-file=.env.local dev-server.js` in place of
`npm run dev:api`.

## Deploying to Vercel

1. Import this repository in [Vercel](https://vercel.com/new). The Create React
   App preset is detected automatically; no build settings need changing.
2. In **Settings → Environment Variables**, add `JWT_SECRET` with a long random
   value (for example the output of `openssl rand -hex 32`).
3. In **Storage** (or the Marketplace), add **Upstash Redis** and connect it to
   the project. Its credentials are added as environment variables
   automatically. The free tier is plenty for this app.
4. Redeploy so the new variables take effect.

Without step 3 the app still runs, but shows a "demo mode" banner: data lives
in memory, so it disappears whenever Vercel recycles the function.

## Tests

```bash
npm run test:api   # API tests (in-memory store)
npm test           # React tests
```
