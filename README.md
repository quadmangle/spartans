# Improved Fortnight

This project hosts static web assets. Deployment on Netlify applies additional
security hardening and observability.

## Security Headers

Netlify is configured via `netlify.toml` to include the following HTTP
response headers for all pages:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`

## Validation

Run the automated test suite to ensure the header configuration remains
present:

```sh
npm test
```

For production deployments, scan the live site with tools like [Mozilla
Observatory](https://observatory.mozilla.org/) to verify these headers are
served correctly.

## Governance

Operational policies for mobile and tablet platforms are documented in the [OPS Mobile & Tablet Annex v1.1](docs/OPS-Mobile-Tablet-Annex.md).

