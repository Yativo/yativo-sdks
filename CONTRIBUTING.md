# Contributing

This repository holds what the Yativo SDKs share: the endpoint spec, the code generator and the guide. Code changes to an SDK go to that SDK's repository: each has its own CONTRIBUTING.md.

## Requirements

- Python 3.9+ (the generator)
- Go 1.18+ (only for `gofmt`, when regenerating the Go SDK)
- Git, and Node.js 18+ to check the guide's scripts

## Changing the spec

1. `bash tools/clone-sdks.sh` checks out every SDK next to the spec.
2. Edit `spec/endpoints.json`. Each method has a `name`, an `http` verb, a `path` (path parameters in `{braces}`), a `kind` and a one-line `doc`:
   - `get`: path parameters only
   - `query`: optional query-string filters
   - `list`: optional filters, returns a page
   - `body`: a JSON body
   - `delete`: no body
3. `bash tools/sync-spec.sh` regenerates every SDK and the guide's endpoint list.
4. Run each SDK's tests, then open a pull request here and in each changed SDK repository.

Keep method names identical across languages (the generator converts the case). Use the endpoint's public path exactly as documented at [docs.yativo.com](https://docs.yativo.com).

## Changing the guide

- Edit `docs/index.html`, `docs/assets/guide.css` or `docs/assets/guide.js`. No build step.
- Code samples sit in `<script type="text/plain" data-lang="...">` blocks, so write them without HTML escaping.
- Every sample must match the SDK's real API. Run it if you can.
- Check light and dark mode, a phone-sized window, and `prefers-reduced-motion`.
- The page has a Content-Security-Policy: no inline scripts or `style=""` attributes, and only `cdnjs.cloudflare.com` for external scripts, pinned with an integrity hash.

## Rules for every change

- Never include real API keys, secrets, customer data or internal system details.
- Don't name the banks, processors or other providers behind Yativo features.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE). Please follow the [code of conduct](CODE_OF_CONDUCT.md).
