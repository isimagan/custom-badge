# Changelog

All notable changes to this project are documented in this file.

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
