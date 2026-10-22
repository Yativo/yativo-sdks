# Yativo SDKs

Official libraries for the [Yativo Fiat API](https://docs.yativo.com): collect payments, send payouts, manage customers, virtual accounts and cards, and handle webhooks.

**Guide (every language, step by step):** [yativo.github.io/yativo-sdks](https://yativo.github.io/yativo-sdks/)

## Pick your SDK

| | Repository | Install |
|---|---|---|
| Node.js / TypeScript | [Yativo/yativo-fiat-node](https://github.com/Yativo/yativo-fiat-node) | `npm install @yativo/fiat-sdk` |
| Python | [Yativo/yativo-fiat-python](https://github.com/Yativo/yativo-fiat-python) | `pip install yativo-fiat-sdk` |
| PHP | [Yativo/yativo-fiat-php](https://github.com/Yativo/yativo-fiat-php) | `composer require yativo/fiat-sdk` |
| Laravel | [Yativo/yativo-fiat-laravel](https://github.com/Yativo/yativo-fiat-laravel) | `composer require yativo/fiat-sdk-laravel` |
| Go | [Yativo/yativo-fiat-go](https://github.com/Yativo/yativo-fiat-go) | `go get github.com/Yativo/yativo-fiat-go` |
| WooCommerce plugin | [Yativo/yativo-fiat-woocommerce](https://github.com/Yativo/yativo-fiat-woocommerce) | Download `yativo-payments.zip` from its releases |

Each repository stands on its own: a beginner-friendly README, runnable examples, a full method reference, tests with their latest results, CI, and contribution guidelines.

Every SDK:

- authenticates with your API key (`X-Api-Key` + `X-Api-Secret`)
- adds an `Idempotency-Key` to every write, and safely retries network errors, `429` and `5xx`
- verifies webhook signatures and routes events to your code
- keeps your credentials out of logs and errors, and only talks HTTPS
- has no third-party runtime dependencies

## What's in this repository

```
spec/endpoints.json   every endpoint, described once: the source for all SDKs
tools/generate.py     writes each SDK's resource classes and docs/REFERENCE.md from the spec
tools/clone-sdks.sh   clones every SDK repository next to the spec
tools/sync-spec.sh    copies the spec into each SDK and regenerates them
docs/                 the guide, served by GitHub Pages
```

### Add or change an endpoint

```bash
bash tools/clone-sdks.sh          # once: checks out node/, python/, php/, laravel/, go/, wordpress/
# edit spec/endpoints.json
bash tools/sync-spec.sh           # regenerates every SDK and the guide's endpoint list
```

Then run each SDK's tests and open a pull request in each repository that changed. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Work on the guide

The guide is static HTML, CSS and JavaScript in `docs/`, with no build step. Preview it with:

```bash
python3 -m http.server 8000 --directory docs
```

GitHub Pages serves it from the `main` branch, `/docs` folder.

## Security

Report vulnerabilities privately to security@yativo.com. See [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Yativo
