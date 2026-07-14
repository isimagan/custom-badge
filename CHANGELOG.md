# Changelog

All notable changes to this project are documented in this file.

## v0.6.0

### Added

- Added `primary` and `secondary` as the preferred text options.
- Added `show_primary` and `show_secondary` for controlling the visibility of each text line.
- Added `primary_color` and `secondary_color` as the preferred text color options.

### Changed

- Aligned the badge structure and default styling more closely with Home Assistant's standard badge.
- `primary` now renders as the main `.content` text and defaults to the formatted entity state.
- `secondary` now renders as the smaller `.label` text and defaults to the entity friendly name.
- Updated the default badge size, spacing, border, radius, typography and icon size to use Home Assistant theme variables.
- Entity states are now formatted with `hass.formatEntityState()` when available.
- Missing entities now use the fixed fallback text `Entity not found`.
- JavaScript template errors now use the fixed fallback text `Template error` and log the underlying error to the browser console.
- Kept `label`, `show_label` and `label_color` as aliases for the corresponding primary options.
- Kept `name`, `show_name` and `name_color` as aliases for the corresponding secondary options.
- Kept `color` as an alias for `icon_color`.

### Removed

- Removed the configurable layout options `border_color`, `height`, `border_radius`, `padding`, `gap` and `icon_size`.
- Removed the configurable fallback labels `missing_entity_label`, `unknown_label`, `unavailable_label` and `template_error_label`.
- Removed the conditional visibility options `hide_if_missing`, `hide_if_unknown` and `hide_if_unavailable`.
- Removed the obsolete `badge-visibility.js` source module.

### Breaking changes

- The meaning of `primary` and `secondary` has changed to match Home Assistant conventions:
  - `primary` is now the main content/state line.
  - `secondary` is now the smaller label/name line.
- Configurations using removed layout, fallback-label or conditional-visibility options must be updated.
- Existing configurations using `label` and `name` remain compatible.

### Notes

- The badge type remains `custom:custom-js-badge`.
- Existing action configurations and JavaScript templates remain supported.
- HACS continues to install the generated `dist/custom-badge.js` bundle.

## v0.5.1

### Changed

- Completed the modular source split under `src/`.
- Separated badge state, rendering, styling, interactions, registration, templates and actions into responsibility-specific modules.
- Reduced `custom-js-badge.js` to the custom element lifecycle and coordination logic.
- Rebuilt the generated `dist/custom-badge.js` bundle from the modular source.

### Removed

- Cleaned up obsolete generated JavaScript files that were no longer used by HACS.

### Notes

- Existing `custom:custom-js-badge` configurations were not affected.

## v0.5.0

### Removed

- Removed `custom:custom-template-badge`.
- Removed the template badge visual editor.
- Removed the separate generated `dist/custom-js-badge.js`, `dist/custom-template-badge.js` and `dist/custom-template-badge-editor.js` files.

### Changed

- The project now contains only `custom:custom-js-badge`.
- Split the editable JavaScript source into modules under `src/`.
- Added an esbuild-based build process.
- HACS now installs one generated bundle: `dist/custom-badge.js`.
- Rewrote the README for the JavaScript badge only.
- Kept the existing `custom:custom-js-badge` type to avoid breaking JavaScript badge configurations.

### Notes

- This is a breaking release for users of `custom:custom-template-badge`; those configurations must be removed or migrated to JavaScript templates.
- Run `npm install` and `npm run build` after changing files under `src/`.

## v0.4.2

### Fixed

- Fixed template badge styling and layout handling.

## v0.4.1

### Fixed

- Fixed template badge registration and editor loading.

## v0.4.0

### Added

- Added multi-actions, sequential actions, delays and service calls.
- Added the template badge visual editor.

## v0.3.3

### Changed

- Updated typography and default sizing.

## v0.3.2

### Fixed

- Added `custom-badge.js` as the shared HACS entrypoint.

## v0.3.1

### Fixed

- Improved badge picker registration.

## v0.3.0

### Added

- Added `custom:custom-template-badge`.

## v0.2.2

### Added

- Added version metadata and guarded registration.

## v0.2.1

### Added

- Added missing, unknown and unavailable entity handling.

## v0.2.0

### Added

- Added layout options.

## v0.1.9

### Added

- Added color options.

## v0.1.8

### Added

- Added tap, hold and double-tap actions.

## v0.1.6

### Added

- Added JavaScript templates.

## v0.1.5

### Added

- Added formatted state display.

## v0.1.3

### Changed

- Added Home Assistant state icon fallback.

## v0.1.2

### Changed

- Updated badge typography.

## v0.1.1

### Added

- Added entity defaults.

## v0.1.0

### Added

- Initial custom badge.
