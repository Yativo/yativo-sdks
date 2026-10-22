# Security

## Reporting a vulnerability

Please report security issues privately to **security@yativo.com**, not in a
public issue. Include the SDK, version and steps to reproduce. We'll confirm
receipt and keep you updated while we fix it.

## How the SDKs protect your credentials

- Requests only go over HTTPS (plain HTTP is accepted for `localhost` only), and
  redirects are never followed, so your API key can't be sent to another host.
- The API key and secret are kept out of logs, `print`/`var_dump`/`fmt` output,
  error messages and serialization.
- Webhook signatures are checked with a constant-time comparison.
- None of the SDKs has third-party runtime dependencies.

## Your part

- Keep `YATIVO_API_KEY`, `YATIVO_API_SECRET` and `YATIVO_WEBHOOK_SECRET` in a
  secrets manager or environment variables. Never commit them.
- Call Yativo from your servers only, never from a browser or mobile app.
- Give each system its own API key with only its server IPs.
- Confirm payments with the API before you fulfil an order.
