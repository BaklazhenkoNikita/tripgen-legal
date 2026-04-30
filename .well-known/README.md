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

## assetlinks.json

Enables Android App Links: `https://periploapp.com/{activity,template,join}/*`
URLs open the Periplo Android app directly when installed (matches the
intent filters in `mobile/app.config.ts`).

Package: `com.periploapp.android` (the Periplo-rebrand Android package —
NOT `com.tripgen.app`, which is only used as the iOS bundle identifier).

Fingerprints listed:
- App signing key (Google Play-managed) — from Play Console → Test and
  release → App integrity → Play app signing → SHA-256. This is the cert
  that signs APKs Google actually serves to users from Play Store.
- Upload key (EAS-managed) — from the same page. Covers non-Play
  installs (direct APK builds from EAS).

To rotate: copy the new SHA-256 from Play Console (or
`eas credentials -p android`) and add it to the array; keep old
fingerprints until all old installs are upgraded. Verify after deploy
with Google's official API:

```
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://periploapp.com&relation=delegate_permission/common.handle_all_urls"
```
