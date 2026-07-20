# GPX Time Search

A lightweight browser-based GPX viewer and time search tool. It uses [`gpxparser`](https://www.npmjs.com/package/gpxparser) to read GPX tracks, lets users browse coordinates, and opens selected points in Google Maps.

## Features

- Load one or more GPX files in the browser.
- Search for the closest point to an ISO timestamp.
- Browse points individually or jump to the next recorded date.
- Open the selected point in Google Maps.
- Accept location-only GPX files instead of treating them as empty.
- Fill a missing point timestamp from the file metadata time when available, clearly labeling it as an estimate.

## Use

Open `index.html` through a local static web server, then select one or more `.gpx` files.

For a file without per-point timestamps:

- Its GPS points remain available for point navigation and Google Maps.
- If the GPX metadata contains a time, that time is assigned to undated points as an **estimated** timestamp.
- If no timestamps are available at all, time search is disabled while location browsing remains available.

## Build a self-contained page

Install dependencies and build:

```bash
npm install
npm run build
```

The build generates `dist/index.html`. It inlines the app styles, `gpxparser`, and application code, so the generated page can be deployed without `node_modules`.

## Project structure

```text
.
├── index.html              # Development page shell
├── scripts/
│   └── build-static.js     # Creates a self-contained static HTML page
├── src/
│   ├── gpx.js              # GPX parsing and timestamp fallback
│   ├── navigation.js       # Point and date navigation helpers
│   ├── ui.js               # DOM rendering helpers
│   ├── main.js             # Application state and event handlers
│   └── styles.css          # Page styles
└── dist/
    └── index.html          # Generated build output
```
