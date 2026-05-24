# web.radiohy

A lightweight web interface for Armenian radio stations — no frameworks, no build step, no PHP.

## Features

- Live stream playback via HTML5 audio (no Flash)
- Search stations by name or country
- Filter by country
- Now-playing bar with volume control
- Responsive layout — works on desktop and mobile

## Architecture

| File | Purpose |
|---|---|
| `index.html` | Main station list page |
| `stations.js` | Fetches station data, renders cards, handles playback |
| `stations.css` | Responsive styles |
| `about.html` | About page |
| `forum.html` | Forum embed page |
| `backup.json` | Legacy JS-wrapped station data (kept for Kodi plugin compatibility) |

## Station data

Station data is fetched at runtime from:

```
https://raw.githubusercontent.com/gagikh/xbmc.plugin.audio.radiohy/master/resources/lib/backup.json
```

To add or update stations, edit that file in the [xbmc.plugin.audio.radiohy](https://github.com/gagikh/xbmc.plugin.audio.radiohy) repo.

## Hosting

The site is a fully static — host it anywhere that serves HTML files (GitHub Pages, Netlify, etc.).

To enable GitHub Pages: go to **Settings → Pages** and set the source to the `master` branch root.

## Reporting issues

Please report broken streams or bugs via the [Issues](../../issues) page.
