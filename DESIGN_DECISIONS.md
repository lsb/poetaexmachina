# Design Decisions: Static Migration

## Context

The original poetaexmachina.com runs as a Ruby/Sinatra app behind Caddy (for TLS termination and reverse proxy). We've ported the synthesis pipeline to JavaScript + WASM so it runs entirely in the browser. The goal is to serve the app as static files, removing the need for a backend server.

## URL Compatibility Problem

The old app has URLs that people have bookmarked and shared:

- `GET /` — the form page
- `GET /synth?text=...&meter=...` — returns HTML with macronized text + audio player
- `GET /mp3?text=...&meter=...` — returns synthesized audio (server-side MBROLA + LAME)
- `GET /about.html` — about page
- `GET /font/...` — Ancient Greek font pages
- `GET /public/...` — static assets (images, etc.)

The `/synth` and `/mp3` routes are **dynamic** — they take query parameters and return server-generated content. Static file hosting (S3, Cloudflare Pages, etc.) cannot replicate these because:

1. S3 routing rules don't match or forward query strings
2. Cloudflare Pages `_redirects` explicitly don't support query parameters
3. There is no server to execute the synthesis pipeline

## Decision: Client-Side Routing

Since all synthesis now happens in the browser, old `/synth?text=...&meter=...` links should redirect to the new single-page app with those parameters. The approach:

**Option A: Hash-based redirect (simplest, works everywhere)**

A small `synth/index.html` reads `window.location.search`, extracts `text` and `meter`, and redirects to `/#text=...&meter=...`. The root `index.html` reads the hash on load and pre-fills the form.

**Option B: Single static fallback with JavaScript router**

If serving from a platform that supports SPA fallbacks (Cloudflare Pages, Netlify, Vercel), configure all unknown paths to serve `index.html`. The app reads `window.location.pathname` and `window.location.search` on load to determine what to do.

**Option C: Caddy stays as static file server with rewrite rules**

Keep Caddy, but point it at the static files instead of the Ruby app. Use Caddy's `try_files` and `rewrite` to serve `index.html` for `/synth` and `/mp3` requests, letting the client-side code handle the query parameters.

### Chosen: Option A (hash redirect) as minimum viable, with Option C as deployment path

- Option A works with *any* static hosting (S3, Cloudflare Pages, GitHub Pages, even a Python http.server). It requires only a tiny `synth/index.html` redirect stub.
- For production, Option C (Caddy as static server) is likely the smoothest migration: swap the upstream from the Ruby app to a file_server, add a rewrite rule for `/synth` and `/mp3` to serve `index.html`, and the client JS handles the rest.

## Static File Structure

The served directory contains:

```
index.html              # Main app (form + synthesis + audio playback)
synthesis.js            # Latin text -> MBROLA .pho pipeline
mbrola.js + mbrola.wasm # MBROLA speech synthesizer (Emscripten)
mbrola-wrapper.js       # JS API for MBROLA WASM
poeta-browser.js        # Integration layer
scansions.json          # Word scansion dictionary (~7MB)
i                       # MBROLA Italian voice file (~6MB)
synth/index.html        # Redirect stub for old /synth?... URLs
public/                 # Legacy static assets (about, images, fonts)
```

## /mp3 Compatibility

The old `/mp3` endpoint returned server-generated MP3 audio. The new app produces WAV in the browser. There is no way to serve dynamically-generated audio from static hosting. Options:

1. **Accept the break** — `/mp3` links stop working. Users visiting old `/mp3` links get redirected to the app, which can synthesize and play the same text.
2. **Pre-generate popular passages** — If there are heavily-linked specific texts, we could pre-generate and cache their audio files. This is probably not worth it.

We go with option 1: redirect `/mp3` to the app like `/synth`.

## Caddy Configuration (Production)

If keeping Caddy:

```caddy
poetaexmachina.com {
    root * /srv/poetaexmachina
    file_server

    # Rewrite old dynamic routes to the SPA
    @oldRoutes path /synth /mp3
    rewrite @oldRoutes /index.html

    # Cache immutable assets aggressively
    @assets path *.wasm *.js
    header @assets Cache-Control "public, max-age=86400"

    # Voice and dictionary files are large — cache them
    @data path /i /scansions.json
    header @data Cache-Control "public, max-age=604800"
}
```

## Large File Considerations

Two files are large enough to matter:
- `scansions.json` (~7MB) — the word scansion dictionary
- `i` (~6MB) — the MBROLA Italian voice file

For S3/CDN hosting, these should be served with:
- `Content-Encoding: gzip` (or use pre-compressed `.gz` variants)
- Long `Cache-Control` headers (these rarely change)
- Consider converting `scansions.json` to a more compact binary format in the future
