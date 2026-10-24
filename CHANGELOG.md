# Changelog

All notable changes to `volto-mosaic` will be documented in this file.

## 1.0.0 (2026-10-23)

### Features
- Initial standalone release of **Volto Mosaic (Deco)**.
- **2D Canvas Interactions**: Drag-and-drop to split blocks into multi-column rows, reorder within columns, or insert into columns.
- **Column Drop Zone**: Support dragging blocks into columns above, between, or below current items with narrow edge detection (max 28px) so inner drops are natural and fluid.
- **Interactive Column Resizing**: Grab between columns with live percentage tooltip and magnetic snap points (50/50, 60/40, 40/60, 67/33, 33/67, 75/25, 25/75, 80/20, 20/80).
- **Visual Layout Preset Widget**: Clean SVG preview cards ordered ascending by column count (1 to 6 columns).
- **Non-Overlapping Drag Handle**: Tabbed Row drag handle sits above the row container with a dedicated badge.
- **Empty Column Actions**: Centered Add (`+`) and Delete buttons with empty column hint.
- **Style Presets**: Stat Cards and Red Banner + Stat Cards presets with card elevations, rounded corners, and isolated row background application.
- **Responsive Stacking**: Automatic single-column layout on mobile devices with optional reverse stack order.
- **Migration Middleware**: Seamless in-flight normalization of legacy `columnsBlock` and `gridBlock` data to modern `row` blocks.
