# .well-known — Universal Links & App Links

## apple-app-site-association (AASA)

Enables iOS Universal Links: `https://periploapp.com/{activity,template,join}/*`
URLs open the Periplo iOS app directly when installed.

Current appID: `3LRF5283H2.com.tripgen.app` (Team ID + iOS bundle ID).
If the Team ID ever changes (e.g. org transfer), update it in
`apple-app-site-association` — lookup: Apple Developer portal →
Membership, or `eas credentials -p ios`.

Serve requirements (GitHub Pages handles these automatically with the
`.nojekyll` marker file at the repo root):

- HTTPS, 200 OK, no redirects
- Content-Type: `application/json` (GH Pages infers this for a filename
  with no extension and JSON content; verify with `curl -i`)
- Path: exactly `/.well-known/apple-app-site-association` at the site root

Apple's CDN caches the file for 24h after first fetch; test changes on a
throwaway path first or use `swcutil dsc` on macOS to inspect the cache.

## assetlinks.json — not yet shipped

Android App Links will need `.well-known/assetlinks.json` with the Play
Store release key SHA256 fingerprint. Skipped for now because the app is
not yet on Play Store (see `mobile/src/config/appStore.ts`). When Android
ships, add the file with content:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.tripgen.app",
    "sha256_cert_fingerprints": ["<get from `eas credentials -p android`>"]
  }
}]
```
