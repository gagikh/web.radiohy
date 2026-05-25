# web.radiohy

**Live:** http://gagikh.github.io/web.radiohy/

A lightweight web interface for Armenian radio stations — no frameworks, no build step, no PHP.

## Features

- Live stream playback via HTML5 audio (no Flash, no PHP)
- Search stations by name or country
- Filter by country
- Now-playing bar with volume control
- Stream connection timeout with animated loading indicator
- Responsive grid layout — works on desktop and mobile
- Single-page app: contact view is a hash route (`#contact`) so audio keeps playing while navigating

## Architecture

| File | Purpose |
|---|---|
| `index.html` | Main page — station grid and contact view (hash-routed SPA) |
| `stations.js` | Data fetch, card rendering, playback, routing |
| `stations.css` | Responsive styles |
| `contact.html` | Redirects to `index.html#contact` for bookmark compatibility |
| `stations.json` | Station data (also used by the Kodi plugin) |

## Station data

Station data is fetched at runtime from:

```
https://raw.githubusercontent.com/gagikh/xbmc.plugin.audio.radiohy/master/resources/lib/stations.json
```

To add or update stations, edit that file in the [xbmc.plugin.audio.radiohy](https://github.com/gagikh/xbmc.plugin.audio.radiohy) repo.

## Hosting

The site is a fully static — host it anywhere that serves HTML files (GitHub Pages, Netlify, etc.).

To enable GitHub Pages: go to **Settings → Pages** and set the source to the `master` branch root.

## Reporting issues

Please report broken streams or bugs via the [Issues](../../issues) page.
