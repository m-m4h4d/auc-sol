// Small helpers shared by the API routes. Files in api/_lib are not exposed as
// routes because Vercel ignores paths that start with an underscore.
const jwt = require('jsonwebtoken');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const DEV_SECRET = 'dev-only-secret-do-not-use-in-production';

function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new HttpError(500, 'Server is missing the JWT_SECRET environment variable.');
  }
  return DEV_SECRET;
}

function signToken(username) {
  return jwt.sign({ sub: username }, jwtSecret(), { expiresIn: '7d' });
}

// Returns the logged-in username or throws a 401.
function requireUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'You need to log in first.');
  try {
    return jwt.verify(token, jwtSecret()).sub;
  } catch (err) {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }
}

// Wraps a map of { METHOD: handler } into a Vercel function with consistent
// method checks and JSON error responses.
function route(handlers) {
  return async (req, res) => {
    const handler = handlers[req.method];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error(err);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}

module.exports = { HttpError, jwtSecret, signToken, requireUser, route };
