const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const useSecureCookies = process.env.COOKIE_SECURE !== 'false';

// Enforce HTTPS in production. Cookies are always set to secure unless
// overridden with COOKIE_SECURE=false for local development.
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '.')));

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: useSecureCookies,
    },
  })
);

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.get('/api/csrf-token', (req, res) => {
  const token = generateToken();
  req.session.csrfToken = { value: token, expires: Date.now() + 10 * 60 * 1000 };
  res.json({ token });
});

app.post('/api/contact', (req, res) => {
  const { csrfToken } = req.body;
  const sessionToken = req.session.csrfToken;
  if (
    !csrfToken ||
    !sessionToken ||
    sessionToken.value !== csrfToken ||
    Date.now() > sessionToken.expires
  ) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  const newToken = generateToken();
  req.session.csrfToken = { value: newToken, expires: Date.now() + 10 * 60 * 1000 };
  res.set('X-CSRF-Token', newToken);
  // Process data here (omitted)
  res.json({ ok: true });
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
