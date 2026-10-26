# Changelog

All notable changes to `volto-deco` will be documented in this file.

## 1.2.2 (2026-10-26)

### Features & Multi-Block Selection Restoration
- **Full Multi-Block Selection with Modifier Keys (Ctrl / Cmd / Shift):**
  - Restored multi-block selection capability across all Volto blocks (single blocks, Slate editors, styled boxes, and Row blocks) without altering visual aesthetics, margins, padding, or WYSIWYG alignment.
  - Implemented `onMouseDownCapture` and `onClickCapture` modifier event interceptors in [EditBlockWrapper.jsx](file:///Users/rnunez/devel/yc19/frontend/packages/volto-deco/src/customizations/components/manage/Blocks/Block/EditBlockWrapper.jsx) to prevent Slate contenteditable focus stealing when holding `Ctrl`, `Cmd` (Mac), or `Shift`.
  - Added modifier support to gutter drag handles so clicking any drag handle with `Ctrl` / `Cmd` toggles multi-selection instead of resetting to a single active block.
  - Added multi-block selection styling in [deco.css](file:///Users/rnunez/devel/yc19/frontend/packages/volto-deco/src/theme/deco.css) with zero-layout-shift `::before` outline (`2px solid #007bc1`) and prominent blue drag handle state (`.is-multi-selected`).
  - Enabled standard Volto toolbar actions (`Copy blocks`, `Cut blocks`, `Delete blocks`, and `Paste blocks`) when multiple blocks are selected.
- **Full-Width Row Style Preset Width & Column Containment:**
  - Updated full-width rows with style presets (`has--block-width--full[class*='has--style_name--']` / `[class*='-box']`) to enforce `1440px` (`--layout-container-width`) inner container constraint (`.block-inner-container`) instead of `940px`, ensuring edge-to-edge background presets match full layout breadth in both View and Edit modes.
  - Enforced `min-width: 0 !important;` on edit mode `.blocks-form`, `fieldset`, and `fieldset > div` to prevent wide horizontal slider tracks (`.slick-track`) from expanding `<fieldset>`'s default `min-content` formatting context, which previously shifted centered blocks off-screen.
  - Enforced strict column and canvas containment on row column children, fieldsets, blocks forms, and carousels/sliders (`.advancedView`, `.advancedSlider`, `.slick-slider`, `.slick-list`) so Advance Carousel always stays within boundaries during editing without pushing other blocks off-canvas.
  - Added safety guards and empty fallback in `AdvancedCarouselBlockTemplate` to prevent rendering unmounted Slider structures when items are empty or undefined.

## 1.2.1 (2026-10-25)

### Bug Fixes & WYSIWYG Tool Alignment
- **Gutter Tool Placement & Anti-Clipping Architecture:**
  - Resolved issue where block editing tools (drag handle and delete button) were clipped or rendered as white notches cut into rounded corners of styled blocks.
  - Positioned single block drag handle at `left: 0 !important; margin-left: -32px !important; top: 0 !important;` and delete button at `right: -32px !important; margin-right: 0 !important; top: 0 !important;`, keeping tools cleanly accessible in the canvas gutters outside the styled box.
  - Enforced `overflow: visible !important; border-radius: 0 !important;` on `[class*='block-editor-']`, `.ui.drag.block.inner`, and `.blocks-form fieldset > div > div` so gutter tools are never clipped.
  - Applied `border-radius: var(--yc-radius-card, 8px) !important; overflow: hidden !important;` strictly to inner styled content containers (`.styled-title`, `.styled-slate`, `.styled`, non-row `[class*='-box']`, etc.), preserving pristine rounded corners.
- **True WYSIWYG Spacing & Height Normalization:**
  - Reset top and bottom margins on heading and paragraph elements inside `.styled-title`, `.styled-slate`, and deep Slate editor nodes in Edit mode, ensuring styled block height (97px) matches View mode identically.
  - Normalized vertical spacing between styled blocks (`1.75rem`) and reset `.blocks-form .ui.drag.block.inner, .blocks-form .block:not(.row) { margin-bottom: 0 !important; }` in Edit mode to prevent extraneous spacing.
  - Elevated selected block and tool layering to `z-index: 10000 !important;` for immediate visibility and interaction.

## 1.2.0 (2026-10-25)

### Features & Architecture Consolidation
- **Universal Single Block & Multi-Column Row Width Adaptation:** Resolved issue where regular single blocks (slate, title, custom blocks) were not adapting to selected widths. Implemented automatic view wrapper injection in `installBlockWidth` so non-styled blocks (like plain Slate paragraphs and lists) with custom widths (`narrow`, `layout`, `full`) are properly wrapped and adapt to their container width in View mode.
- **True WYSIWYG Edit Mode & View Mode Parity:**
  - **UI Z-Index Overlap & Tool Accessibility:** Elevated selected block containers and set editing tools (drag handle, delete button, add button, mosaic drop lines) to `z-index: 10000`, ensuring they remain on the highest layer and are never covered by background textures, pseudo-elements, or adjacent blocks.
  - Enforced `940px` (`--default-container-width`) inner container constraint on full-width rows with style presets across both View and Edit modes (`.block-inner-container`), guaranteeing column images and content render at identical pixel dimensions (~`439px`) with proper edge breathing margins.
  - Reset outer Volto editor wrappers (`[class*='block-editor-']:not(.block-editor-row)`) to transparent background and zero padding for styled blocks, eliminating duplicate backgrounds/borders and doubled padding around inner `.styled-*` elements in Edit mode.
  - Excluded row-column nested blocks from top-level edit canvas width constraints to maintain clean multi-column layouts without distortion.
- **Complete Layout & DnD Logic Consolidation:** Consolidated all single row and multi-column row layout, 2D canvas drag-and-drop, interactive column divider resizer, container width widgets (`ContainerWidthWidget`), and block width schema enhancers (`installBlockWidth`) into `volto-deco` as the single authoritative addon.
- **View Breakout Scoping:** Scoped 100vw and 1440px breakout rules strictly to View mode (`#page-document`, `.view-wrapper`, `#view`, `body:not(.view-editview)`), eliminating rogue `left: 50%` offsets in edit mode that shifted row containers and cut off multi-column content behind the sidebar. Ensured edit mode canvas cleanly fits between toolbar and sidebar with exact proportional container widths (`default` 940px, `narrow` 720px, `layout` min(1440px, 100%), `full` 100% canvas).

## 1.1.1 (2026-10-25)

### Container Width & Layout
- **Container and RowColumns Width Parity:** Unified `#page-document.ui.container` with multi-column row columns default width (`940px`), ensuring nested blocks, headings, and column layouts share identical width and margins.

## 1.1.0 (2026-10-24)

### Features & Styling
- **Single Block Row & Multi-Column Row Style Parity:** Unified Single Block Row styling with Multi-Column Row styles, ensuring identical padding, margins, colors, and border rendering between edit mode and published view mode.
- **Row Full-Width Background Breakout:** Enhanced full-width background image and color breakout logic in `RowEdit.tsx`, `RowView.tsx`, and `deco.css` with responsive breakout calculations that account for the Volto edit sidebar, toolbar, and container constraints.
- **Sidepanel Layout Improvements:** Moved row background image widget to the bottom of the block styling sidepanel for an intuitive editing workflow.
- **Packaging:** Added `.npmignore` and normalized repository publishing metadata.

## 1.0.0 (2026-10-23)

### Features
- Initial standalone release of **Volto Deco**.
- **2D Canvas Interactions**: Drag-and-drop to split blocks into multi-column rows, reorder within columns, or insert into columns.
- **Column Drop Zone**: Support dragging blocks into columns above, between, or below current items with narrow edge detection (max 28px) so inner drops are natural and fluid.
- **Interactive Column Resizing**: Grab between columns with live percentage tooltip and magnetic snap points (50/50, 60/40, 40/60, 67/33, 33/67, 75/25, 25/75, 80/20, 20/80).
- **Visual Layout Preset Widget**: Clean SVG preview cards ordered ascending by column count (1 to 6 columns).
- **Non-Overlapping Drag Handle**: Tabbed Row drag handle sits above the row container with a dedicated badge.
- **Empty Column Actions**: Centered Add (`+`) and Delete buttons with empty column hint.
- **Style Presets**: Stat Cards and Red Banner + Stat Cards presets with card elevations, rounded corners, and isolated row background application.
- **Responsive Stacking**: Automatic single-column layout on mobile devices with optional reverse stack order.
- **Migration Middleware**: Seamless in-flight normalization of legacy `columnsBlock` and `gridBlock` data to modern `row` blocks.
