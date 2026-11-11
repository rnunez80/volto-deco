# Changelog

All notable changes to `volto-deco` will be documented in this file.

## 1.2.13 (2026-11-11)

### Drop Indicators, Slate Block Spacing & Row Image Gap (`RowEdit.tsx`, `EditBlockWrapper.jsx`, `deco.css`)
- **Single Vertical Drop Line Guarantee:**
  - Fixed double vertical `.mosaic-drop-line` indicators when dragging over rows/columns by explicitly passing `isContainer={true}` and ensuring `colData` retains `'@type': 'rowColumn'` in `RowEdit.tsx`.
  - Added strict `!isNested` guard (`{!isNested && dropPosition && ...}`) in `EditBlockWrapper.jsx` to prevent inner column blocks from ever rendering outer canvas vertical drop lines.
- **Slate Text Block Spacing in Edit Mode:**
  - Resolved text blocks collapsing directly against each other in Edit mode by adding high-specificity `#page-edit` rules with `margin-bottom: 1rem !important;` for `.block-editor-slate`, perfectly mirroring View mode paragraph rhythm.
  - Added `:not(.block-editor-slate):not(.block-editor-image)` exclusion to root-level zero-gap rules under `#page-edit`.
- **Row Column Image Spacing & Zero Gap Between Rows:**
  - Set image blocks inside `.row-column` to default to `margin-bottom: 0 !important;` (applying `1.5rem` only when followed by a sibling block with `:has(~ [class*='block-editor-'])`).
  - Reset all inner edit-mode image block elements (`#page-edit .block.image`, `.blocks-form .block-editor-image .block.image`, `figure`, `p`, `img`) to `margin-bottom: 0 !important;` to eliminate stacked bottom margins pushing subsequent rows down.

## 1.2.12 (2026-11-11)

### Image & Text Block Spacing and Column Text Wrapping (`deco.css`)
- **Image Block Vertical Spacing Parity:**
  - Standardized image block bottom spacing to `1.5rem` (`margin-bottom: 1.5rem !important;`) applied strictly once to root containers (`.blocks-form .block-editor-image` in Edit mode and `#page-document .block.image`, `.view-wrapper .block.image` in View mode).
  - Reset all nested inner elements (`.block-editor-image .block.image`, `.ui.drag.block.inner`, `figure`, `p`, `img`) to `margin-bottom: 0 !important;` in Edit mode, completely eliminating stacked/triple bottom margins.
  - Added `:last-child` reset (`margin-bottom: 0 !important;`) for image blocks at the end of row columns.
- **Text Block (Slate) Spacing in Edit Mode:**
  - Updated unstyled Slate text blocks in Edit Mode (`.blocks-form .block-editor-slate`, `.blocks-form .block.slate`, and paragraphs) to match View mode paragraph rhythm (`margin-top: 0 !important; margin-bottom: 1em !important;`), preventing text blocks from collapsing directly against adjacent blocks.
- **Image Alignment & Text Wrapping in Row Columns:**
  - Restored block-level document flow in row columns (`.row-column`, `.row-column > .blocks-form > fieldset > div` with clearfix) so floated elements do not get trapped in flex lines.
  - Fixed image alignment behavior without floating the outer editor wrapper (`.block-editor-image { float: none !important; }`), floating the `img` elements directly so drag handles, block controls, and bounding outlines remain stable:
    - `align: right`: floats right (`img { float: right !important; max-width: 50% !important; margin-left: 1.5rem !important; margin-bottom: 1rem !important; }`) with `text-align: right !important` and sibling text wrapping on the left.
    - `align: left`: floats left (`img { float: left !important; max-width: 50% !important; margin-right: 1.5rem !important; margin-bottom: 1rem !important; }`) with `text-align: left !important` and sibling text wrapping on the right.
    - `align: center`: centered with `text-align: center !important; clear: both !important;` and `img { float: none !important; margin: 0 auto; display: inline-block !important; }`.
    - `align: full`: full column width with `width: 100% !important; clear: both !important;` and `img { float: none !important; width: 100% !important; max-width: 100% !important; }`.

## 1.2.11 (2026-11-11)

### Layout & Horizontal Gutter Parity (`deco.css`, `blockWidth.ts`, `RowView.tsx`, `RowEdit.tsx`)
- **Unstyled Blocks & Rows Side Padding:**
  - Added consistent `1.5rem` horizontal side padding (`padding-left: 1.5rem !important; padding-right: 1.5rem !important; box-sizing: border-box !important;`) to unstyled rows and root-level unstyled standalone blocks across both View (`#page-document > *`) and Edit (`.row-edit-container`, `.blocks-form fieldset > div > [class*='block-editor-'] > div > .ui.drag.block.inner`) modes on desktop and mobile.
  - Scoped Edit-mode unstyled row side padding strictly to `.row-edit-container` and reset Volto's outer `.ui.drag.block.inner.row > .block.row:not(.row-edit-container)` wrapper to `padding: 0 !important`, eliminating unwanted inner padding on styled rows and double (`1.5rem + 1.5rem`) side padding on unstyled rows.
  - Ignored `style_name: 'none'` (`has--style_name--none`) in `blockWidth.ts`, `RowView.tsx`, `RowEdit.tsx`, and `deco.css` so blocks with `.styled-*` wrappers and no active style preset align flush with rows and columns instead of receiving box padding.
  - Preserved list marker indentation (`padding-left: 3rem !important; padding-right: 1.5rem !important;`) on root-level unstyled `ul` and `ol` blocks.
- **Full-Width Rows & Standalone Blocks Alignment:**
  - Enforced `0` outer horizontal padding (`padding-left: 0 !important; padding-right: 0 !important;`) on full-width styled/background rows (`.block.row.has--block-width--full`) in both View and Edit modes while `.block-inner-container` provides the single `1.5rem` side padding.
  - Added View-mode support for unstyled full-width standalone content blocks (`#page-document > .has--block-width--full:not(...) > *:not(.block-inner-container)`) so their inner content receives the centered `1440px` max-width and `1.5rem` side padding.
- **Styled Standalone Blocks & Stat Cards Alignment:**
  - Standardized horizontal padding on styled standalone blocks and `statCards` rows (`padding: 2.5rem 1.5rem !important;`, with `0` outer horizontal padding when `.has--block-width--full`) to align with the `1.5rem` gutter across all container widths.

### Edit Mode UX, Spacing, Selection Outlines & Drag-and-Drop (`RowEdit.tsx`, `EditBlockWrapper.jsx`, `deco.css`, `schema.ts`)
- **Zero Vertical Gap & Row-to-Row Drop Zone in Edit Mode:**
  - Set the vertical gap (`margin-top: 0 !important; margin-bottom: 0 !important;`) between root-level blocks/rows and stacked column blocks in Edit Mode to `0`, and removed Volto's default `2rem` bottom margin on `[data-rbd-draggable-context-id]` and `.ui.drag.block`.
  - Reset forced `height: 100%; flex-grow: 1` on `.row-column > .blocks-form` wrappers in Edit Mode to eliminate extra empty bottom space inside columns.
  - Added a `14px` top/bottom row edge drop zone (`isAtRowVerticalEdge`) in `EditBlockWrapper.jsx` so items can be dropped cleanly between rows even with `0` vertical gap.
- **Default Row Vertical Alignment (`schema.ts`, `RowVerticalAlignWidget.tsx`, `StandaloneRowSettings.tsx`, `RowEdit.tsx`, `RowView.tsx`, `deco.css`):**
  - Changed the default row `alignItems` ("Vertical Alignment") setting from `'stretch'` to `'start'` (Top).
- **Single Clean Selection Outline (`deco.css`, `RowEdit.tsx`):**
  - Suppressed Volto's `-9px` expanded `::before` pseudo-element on outer row wrappers and `.row-edit-container`, kept inner block `::before` outlines flush with the block edge (`top: 0; left: 0; width: 100%; height: 100%`), and added `.has-inner-selection` so selecting an item inside a row displays only a single selection line.
- **Single Vertical Drop Indicator on Outer Row Edges (`RowEdit.tsx`, `EditBlockWrapper.jsx`):**
  - Fixed `onDragLeave` in `RowEdit.tsx` to pass `colId` so column drop hints clear properly when leaving a column, and added `handleRowOuterDragOver` / `handleRowOuterDrop` on `.row-edit-container` while delegating non-top/bottom row drags away from `EditBlockWrapper.jsx` to prevent double vertical `.mosaic-drop-line` indicators.
- **Block Style Sidebar Navigation (`RowEdit.tsx`, `EditBlockWrapper.jsx`, `deco.css`):**
  - Fixed clicking "Style palette for slate" (`.open-styles-button`) by ignoring portal clicks outside `.row-edit-container` in `RowEdit.tsx` and switching to the Block sidebar tab (`setSidebarTab(1)`) when selecting standalone non-row blocks in `EditBlockWrapper.jsx`.

## 1.2.10 (2026-11-09)

### Accordion & Style Preset Enhancements
- **Accordion Spacing View/Edit Parity (`deco.css`):**
  - Excluded `:not(.accordion):not(.ui)` from `#page-document .styled:not(...)`, `.view-wrapper .styled:not(...)`, and `#view .styled:not(...)` block vertical rhythm rules, preventing Semantic UI styled accordions (`.ui.styled.accordion`) from inheriting the 1.75rem block vertical spacing between individual accordion panels.
  - Added explicit `.accordion-block .ui.accordion`, `.accordion-block .ui.styled.accordion`, and `.accordion-block .accordion.ui.fluid.styled` spacing rules (`margin-top: 0 !important; margin-bottom: 5px !important;` with `margin-bottom: 0 !important` on `:last-child`), aligning View mode panel spacing to match Edit mode (~5px).
- **Theme-Aware Style Preset Widget (`RowStylePresetWidget.tsx`):**
  - Updated `RowStylePresetWidget.tsx` to read presets dynamically from `config.settings.row_style_presets` or `config.settings.style_presets` while smoothly falling back to built-in presets.
  - Restored high-fidelity swatches and options for `statCardsPrimary` (`Red + Cards`) and `redBlueBox` (`Red / Blue`).

## 1.2.9 (2026-11-09)

### Standalone Decoupling & Complete Architecture Isolation
- **Autonomous Deployment Architecture:**
  - Consolidated all layout, blocks DnD, multi-column row grid, and container width styles directly into `volto-deco` so it can be deployed to any Volto site completely independent of `volto-yc-theme` or `volto-yc19`.
- **Universal Layout & Container Width System (`deco.css`):**
  - Added universal sideways scroll prevention (`overflow-x: clip !important`) across view and edit modes to eliminate horizontal scrolling caused by full-width edge-to-edge breakouts.
  - Centralized `:root` container width system tokens (`--narrow-container-width: 720px`, `--default-container-width: 940px`, `--layout-container-width: 1440px`, `--full-container-width: 100%`) and vertical rhythm tokens (`--block-spacing-vertical`, `--grid-gap`).
  - Added Volto admin toolbar and sidebar offset system (`--volto-toolbar-width`, `--volto-sidebar-width`) with responsive mobile rules for screen widths $\le 768\text{px}$.
  - Added clean WYSIWYG canvas sizing and full-width breakout cancellation across all edit and add view modes.
  - Added anti-duplication styling for block editors and row inner containers.
  - Added centered inner container sizing (`max-width: 1440px`) for all full-width blocks and rows.
  - Added button block layout sizing and modal/toolbar icon button resets.
- **Brand-Neutral Theme Hooks (`deco.css`, `RowStylePresetWidget.tsx`):**
  - Replaced hardcoded York red branding colors (`#cd291e`, `#912018`) and `--yc-radius-card` with themeable hooks: `var(--deco-primary-color, var(--primary-color, #007bc1))` and `var(--deco-radius-card, 8px)`.
  - Updated `RowStylePresetWidget.tsx` options and descriptions to be completely brand-neutral.
- **Zero-Dependency Core (`split.ts`):**
  - Replaced external `lodash/cloneDeep` with an internal deep-clone utility, making `volto-deco` free of unnecessary third-party dependencies.
  - Exported `getImageUrl` helper utility.

### Dark Mode & ADA Contrast
- **Seamless Stat Cards Transition (`deco.css`):**
  - Updated `.stat-cards-primary-box::before` (and row preset variants) in dark mode (`html.dark`) to `#912018 !important; background-image: none !important; box-shadow: none !important;` to match the `#912018` dark red section banner above it seamlessly without a visible transition seam.
- **Stat Cards ADA Contrast in Dark Mode (`deco.css`):**
  - Enforced high-contrast dark text (`#0f172a !important;` for `.value`, `#1e293b !important; font-weight: 700;` for `.label`) inside white stat card containers (`.stat-cards-box .row-column`, `.stat-cards-primary-box .row-column`) in dark mode, eliminating low-contrast pink (`#f87171`) and achieving full WCAG 2.1 AA/AAA compliance (>15:1 contrast).

## 1.2.7 (2026-10-29)

### Sidebar & Editing Improvements
- **Hide "Order" Tab from Right Side Panel (`Sidebar.jsx`, `deco.css`):**
  - Configured `orderTab: false` by default in the edit `Sidebar` component, hiding the "Order" tab from the right side panel navigation header.
  - Rendered a persistent hidden portal target `<div id="sidebar-order" style={{ display: 'none' }} />` to ensure Volto's `BlocksForm.jsx` `createPortal` safely attaches without throwing unmounted container runtime errors.
  - Added CSS rules in `deco.css` to hide `.item-order` and `#sidebar-order` in the edit sidebar.

## 1.2.6 (2026-10-29)

### Layout & Sizing
- **Add Mode (`view-addview`) Width Consistency (`deco.css`):**
  - Added `body.view-addview` alongside `body.view-editview` to full-width, layout (`1440px`), default (`940px`), and narrow container edit rules in `deco.css`.
  - Ensures newly added items follow identical container width constraints and horizontal centering as edit and view modes.

## 1.2.5 (2026-10-29)

### Row & Carousel Improvements
- **Image Block Spacing Consistency:** Ensured `figure.block.image`, `p.block.image`, and `.block.image` inside row columns have `margin-bottom: 2rem;` in View mode, matching Edit mode block spacing, with `:last-child` resetting to `0`.
- **Column Layout Presets Update:** Replaced `70 / 30` with `67 / 33` (`2fr 1fr`) and `30 / 70` with `33 / 67` (`1fr 2fr`) in the Row Column Layout widget presets and schema, with backwards compatibility mapping for existing rows saved with `30-70` and `70-30`.
- **Carousel Controls Column Boundary Containment:** Explicitly assigned `position: relative !important;` to `.row-column .advancedView`, `.row-column .advancedSlider`, and `.row-column .slick-slider` in `deco.css`, ensuring absolute carousel navigation controls (previous/next arrows, slide dots, play/pause controls) stay strictly contained inside their column boundaries in both view and edit modes.

## 1.2.4 (2026-10-29)

### Layout & Cinematic Blocks Integration

- **Universal Container Width Exclusions:**
  - Excluded `.cinematicSlider`, `.cinematicHorizontalScroll`, `.cinematic-slider-wrapper`, and `.cinematic-horizontal-scroll` from narrow, default (`940px`), and layout (`1440px`) container constraints in `deco.css`.
  - Added `block-editor-cinematicSlider` and `block-editor-cinematicHorizontalScroll` to full-width block-editor rules in Edit mode (100% canvas expansion).
  - Excluded both cinematic block editors from the default `940px` edit mode restrictions.

## 1.2.3 (2026-10-26)

### Features & Layout Enhancements

- **Multi-Column Row Vertical Alignment:**
  - Resolved issue where selecting vertical alignment options ('Top', 'Middle', 'Bottom') had no effect due to missing CSS classes.
  - Added matching CSS selectors in `deco.css` for `.row-inner-container.align--start`, `.align--center`, and `.align--end` (with `.align--flex-start` and `.align--flex-end` aliases).
  - Added direct inline `alignItems` style mapping on `.row-inner-container` in `RowEdit.tsx` and `RowView.tsx` (`flex-start`, `center`, `flex-end`, `stretch`).
  - Added value normalization in `RowVerticalAlignWidget.tsx` so legacy values (`'top'`, `'middle'`, `'bottom'`) activate the corresponding sidebar buttons.
- **Cross-Row & Cross-Column Block Dragging:**
  - Enabled dragging blocks out of multi-column row columns and dropping them into other rows, empty columns, or the root canvas.
  - Updated `split.ts` (`insertBlockAsNewColumn`, `insertBlockIntoExistingColumn`) to support nested and legacy block containers (`row.blocks`, `row.data.blocks`, `columnsBlocks`) and properly clean up emptied source columns across rows.
  - Enforced `isNested` detection and `z-index: 10000` on column block drag handles so block drag handles within columns are directly draggable.
- **Legacy EEA Columns Block Compatibility:**
  - Registered `RowEdit` and `RowSchema` for legacy `columnsBlock` and `gridBlock` in `index.ts` so older column content uses the modern multi-column row editor.

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
