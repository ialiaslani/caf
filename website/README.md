# CAF Documentation Website

This is the documentation website for [CAF — Clean Architecture Frontend](https://github.com/ialiaslani/caf). It is built with [Docusaurus 3](https://docusaurus.io/).

## Run locally

From the **repository root** (with dependencies installed):

```bash
yarn workspace @c-a-f/website start
```

Or from this directory:

```bash
cd website
yarn install
yarn start
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
yarn workspace @c-a-f/website build
```

Output is in `website/build/`. Serve with:

```bash
yarn workspace @c-a-f/website serve
```

## Structure

- **`docs/`** — Documentation source (intro, getting started, guides, architecture, reference).
- **`src/pages/`** — Homepage and custom pages.
- **`static/`** — Static assets (favicon, logo).
- **`docusaurus.config.js`** — Site config (title, navbar, footer, theme).
- **`sidebars.js`** — Sidebar structure for the docs.

## Editing docs

Edit Markdown files in `docs/`. The sidebar is defined in `sidebars.js`. Use frontmatter for `title`, `sidebar_position`, and `slug` when needed.
