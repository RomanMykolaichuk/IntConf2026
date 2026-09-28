# IntConf2026 — Conference Programme

Static web project for the **RDDC–NDUU International Conference: Artificial Intelligence in Military Education and Defence (October 2026, Kyiv)**.

## What is included

- responsive conference programme website;
- conference-day navigation;
- **Edit programme** mode directly in the browser;
- automatic saving of browser edits with `localStorage`;
- **Download data** export to a ready-to-replace `programme.js` file;
- clean A4 **Print / Save PDF** output;
- GitHub Pages deployment workflow;
- QR-free conference artwork stored in `assets/conference-brand.jpg`.

## Easiest way to edit

1. Open the website.
2. Click **Edit programme**.
3. Click any outlined title, time, activity, speaker, venue or note and type the correction.
4. Edits are automatically remembered in that browser.
5. Click **Download data** to get the updated `programme.js`.
6. Replace `data/programme.js` in this repository with the downloaded file to make the edits permanent for everyone.

The **Reset edits** button removes only browser-local changes and reloads the version stored in the repository.

## Direct repository editing

For simple GitHub-side edits, most content is kept in one file:

`data/programme.js`

The data structure is intentionally plain: conference metadata → days → sections → programme items. Times, titles, topics, speakers and remarks can therefore be edited without changing HTML or CSS.

## Conference artwork

The supplied conference visual has been cropped before the QR-code block and stored as:

`assets/conference-brand.jpg`

The website references this local repository asset; it does not depend on an external image URL.

## PDF

Open the website and click **Print / Save PDF**. All conference days are included in print output even when only one day is visible on screen. The print stylesheet uses A4 formatting and hides editing/navigation controls.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the repository root whenever `main` changes.

If Pages has not yet been enabled for this repository, set **Settings → Pages → Source → GitHub Actions** once. After that, pushes to `main` trigger deployment automatically.

> Status: draft conference programme. TBC/TBA/TBD markers are intentionally retained for later confirmation.
