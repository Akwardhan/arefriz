# ARefriz Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, **do NOT open a public GitHub issue**.

Instead, email: **security@arefriz.com** (or contact the repository maintainer directly).

We will acknowledge your report within 48 hours and provide a timeline for a fix.

## Security Practices

### Secrets Management
- All secrets are stored as environment variables, never committed to the repository
- `.env` files are excluded via `.gitignore`
- Production secrets are managed via GitHub Actions secrets or deployment platform (e.g., AWS Secrets Manager)

### Authentication & Authorization
- JWT tokens with configurable expiry
- bcrypt password hashing (12+ rounds)
- Role-based access control (BUYER, DEALER, ADMIN)
- Rate limiting on authentication endpoints (Redis-backed)

### Data Protection
- Server-side price recalculation on checkout (zero-trust)
- Zod schema validation on all API inputs
- Parameterized queries via Prisma ORM (SQL injection prevention)
- CORS restricted to allowed origins
- Helmet.js security headers (CSP, HSTS, X-Frame-Options)

### Payment Security
- Razorpay webhook signature verification (HMAC SHA-256)
- Payment status only updated via verified webhooks (never from client)
- All monetary values stored in paise (integer arithmetic, no floating-point)

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Active |
| 1.x     | ❌ EOL    |
