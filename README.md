# IntConf2026 — Conference Programme

Static web project for the **RDDC–NDUU International Conference: Artificial Intelligence in Military Education and Defence (October 2026, Kyiv)**.

## Purpose

- keep the programme in one editable data file;
- publish a responsive programme website;
- switch quickly between conference days;
- print the programme cleanly to A4 / **Save as PDF** from the browser;
- preserve the supplied conference visual identity while using a QR-free brand image.

## Quick editing

Most programme changes are made in:

`data/programme.js`

The page itself is built from that data automatically, so timing, titles, speakers, remarks, venues and day-level notes can be edited without touching the HTML.

## Local preview

Open `index.html` directly in a browser, or serve the repository with any simple static web server.

## PDF

Open the website and use **Print / Save PDF**. The print stylesheet hides navigation and controls and formats the programme for A4 output.

## GitHub Pages

A GitHub Actions workflow in `.github/workflows/pages.yml` deploys the repository root to GitHub Pages on every push to `main`.

> Status: draft conference programme. TBC/TBA items are intentionally preserved for later editing.
