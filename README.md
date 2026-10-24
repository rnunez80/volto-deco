# Volto Deco

[![npm version](https://img.shields.io/npm/v/volto-deco.svg)](https://www.npmjs.com/package/volto-deco)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Volto](https://img.shields.io/badge/Volto-17%20%7C%2018%20%7C%2019-blue)](https://github.com/plone/volto)

> **Next-generation 2D canvas drag-and-drop & interactive multi-column row grid layout system for Plone Volto.**  
> Inspired by Plone Deco and Plone Mosaic, re-engineered for modern Volto.

---

## Overview

**Volto Deco** (`volto-deco`) brings true fluid 2D canvas layout editing to Plone Volto. It replaces rigid and legacy column systems (`@eeacms/volto-columns-block`, legacy `gridBlock`) with an intuitive, unified **Row** block (`@type: 'row'`).

Content editors can split blocks into multi-column rows simply by dragging them side-by-side, resize columns interactively with magnetic snapping, and drag blocks directly into existing columns above or below other blocks.

---

## Key Features

### 1. 2D Canvas Drag-and-Drop (Mosaic Interactions)
- **Split into Columns**: Drag any block by its handle to the left or right edge of another block to instantly create a multi-column row.
- **Insert Into Columns**: Drag blocks from anywhere on the page into an existing row column, placing them **above**, **between**, or **below** current items with a thin, precise blue drop indicator.
- **Intra-Column Reordering**: Drag items up and down within the same column to reorder them cleanly.
- **Extract to Root**: Drag an item out of a row to return it to the root page layout.

### 2. Interactive Column Divider Resizer
- Hover between adjacent columns to reveal a fluid resizer handle with gripper dots.
- Drag left or right to interactively redistribute column widths.
- Displays a real-time floating percentage tooltip.
- **Magnetic Snapping**: Snaps smoothly to common column presets:
  - `50% / 50%` (1 : 1)
  - `60% / 40%` (3 : 2)
  - `40% / 60%` (2 : 3)
  - `67% / 33%` (2 : 1)
  - `33% / 67%` (1 : 2)
  - `75% / 25%` (3 : 1)
  - `25% / 75%` (1 : 3)
  - `80% / 20%` (4 : 1)
  - `20% / 80%` (1 : 4)

### 3. Visual Layout Preset Widget
A visual sidebar selector displaying miniature SVG preview cards organized ascending by column count:
- **1 Column**: `100%`
- **2 Columns**: `50 / 50`, `60 / 40`, `40 / 60`, `70 / 30`, `30 / 70`, `80 / 20`, `20 / 80`
- **3 Columns**: `33 / 33 / 33`, `25 / 50 / 25`, `50 / 25 / 25`
- **4 Columns**: `25 / 25 / 25 / 25`
- **5 Columns**: `20 / 20 / 20 / 20 / 20`
- **6 Columns**: `6 Columns (Equal)`

### 4. Non-Overlapping Row Drag Handle Tab
- Container-level Row drag handle is tabbed cleanly **above** the row container (`top: -26px`).
- Shows a distinct **Row** badge with a drag icon.
- Never overlaps the first column or first block's inner controls.

### 5. Empty Column Management
- Empty columns display a clean UI with centered `+` (Add Block) and delete (trash) buttons.
- Removing empty columns is available whenever more than 1 column exists.
- Supports adding blocks directly from a quick type bar (`Text`, `Image`, `Video`, `Teaser`) or full Block Chooser.

### 6. Built-In Style Presets & Stat Cards
- Supports row-level style presets where background color, gradient, or banner styles are applied **only** to the row container, avoiding unwanted background duplication on inner items.
- **Stat Cards**: Modern cards with 20px rounded corners, subtle elevation, hover lift effect, and prominent metric typography hierarchy (`h1`/`h2`/first paragraph as big bold stat figures, subsequent text as uppercase description labels).
- **Red Banner + Stat Cards**: Gradient banner header with overlapping white stat cards.

### 7. Responsive Mobile Layout
- Automatically stacks columns into a single vertical column on mobile devices (`max-width: 768px`).
- **Reverse Mobile**: Optional toggle in the sidebar to reverse the column stack on mobile devices (e.g. show the image or call-to-action on top).

### 8. Zero-Downtime Migration Middleware
- Integrated Redux migration middleware automatically and transparently converts legacy `columnsBlock` and `gridBlock` content into modern `row` blocks in-flight and at save time.
- Ensures existing pages load without downtime or broken block warnings.

---

## Installation

### 1. Install the Package

Using `pnpm`:
```bash
pnpm add volto-deco
```

Using `yarn`:
```bash
yarn add volto-deco
```

### 2. Configure `volto.config.js`

Add `volto-deco` to your project's `addons` list:

```js
// volto.config.js
module.exports = {
  addons: [
    'volto-deco',
    // ...other addons
  ],
};
```

---

## Block Data Structure

A Volto Deco Row block stores its columns as sub-containers in standard Volto container format:

```json
{
  "@type": "row",
  "blocks_layout": {
    "items": ["col-uuid-1", "col-uuid-2"]
  },
  "blocks": {
    "col-uuid-1": {
      "@type": "rowColumn",
      "width": "1fr",
      "blocks_layout": { "items": ["block-uuid-a"] },
      "blocks": {
        "block-uuid-a": { "@type": "slate", "value": [...] }
      }
    },
    "col-uuid-2": {
      "@type": "rowColumn",
      "width": "1fr",
      "blocks_layout": { "items": ["block-uuid-b"] },
      "blocks": {
        "block-uuid-b": { "@type": "image", "url": "..." }
      }
    }
  },
  "gridTemplate": "1fr 1fr",
  "layoutPreset": "2-col-equal",
  "gridGap": "1.5rem",
  "alignItems": "stretch",
  "reverseMobile": false
}
```

---

## Development & Testing

Run unit tests with Vitest:

```bash
pnpm --filter volto-deco test
```

Lint code:

```bash
pnpm --filter volto-deco prettier
```

---

## License

Published under the [MIT License](LICENSE).
