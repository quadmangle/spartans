const test = require('node:test');
const assert = require('node:assert');

let missingDeps = false;
try {
  require.resolve('express');
  require.resolve('express-session');
} catch (err) {
  missingDeps = true;
}

if (missingDeps) {
  test.skip('express and express-session must be installed for server tests');
} else {
  // Helper to start server with specific NODE_ENV
  async function withServer(env, fn) {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
    const serverPath = require.resolve('../server');
    delete require.cache[serverPath];
    const app = require('../server');
    const server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      await fn(server);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      delete require.cache[serverPath];
      process.env.NODE_ENV = originalEnv;
    }
  }

  test('environment-specific HTTPS enforcement and cookie security', async (t) => {
    await t.test('production enforces HTTPS and secure cookies', async () => {
      await withServer('production', async (server) => {
        const port = server.address().port;

        const secureRes = await fetch(`http://localhost:${port}/api/csrf-token`, {
          headers: { 'x-forwarded-proto': 'https' },
        });
        const secureCookie = secureRes.headers.get('set-cookie');
        assert.ok(secureCookie && secureCookie.includes('Secure'));

        const redirectRes = await fetch(`http://localhost:${port}/api/csrf-token`, {
          redirect: 'manual',
        });
        assert.strictEqual(redirectRes.status, 302);
        assert.ok(redirectRes.headers.get('location').startsWith('https://'));
      });
    });

    await t.test('development allows HTTP and insecure cookies', async () => {
      await withServer('development', async (server) => {
        const port = server.address().port;

        const res = await fetch(`http://localhost:${port}/api/csrf-token`, {
          redirect: 'manual',
        });
        const cookie = res.headers.get('set-cookie');
        assert.ok(cookie && !cookie.includes('Secure'));
        assert.strictEqual(res.status, 200);
      });
    });
  });
}

