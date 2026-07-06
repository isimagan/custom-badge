# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic versioning where practical.

## v0.4.0

### Added

- Added `multi-actions` support to `custom:custom-js-badge`.
- Added support for running multiple actions sequentially from `tap_action`, `hold_action` or `double_tap_action`.
- Added support for delay steps in multi-actions.
- Added support for service calls through:
  - `perform-action`
  - `call-service`
  - `call_service`
- Added support for `sequence` as an alias for `actions` in multi-actions.
- Added a visual editor for `custom:custom-template-badge`.
- Added `custom-template-badge-editor.js` as a separate editor module.
- Added import of the template badge editor from `custom-template-badge.js`.

### Changed

- Split the template badge editor into its own file for a cleaner file structure.
- Kept `custom-badge.js` as the shared HACS entrypoint.
- Kept `custom-js-badge.js` focused on JavaScript-template badge functionality.
- Kept `custom-template-badge.js` focused on Home Assistant-template badge functionality.

### Notes

- `multi-actions` supports both `action: multi-actions` and `action: multi-action`.
- `wait_completion` is only meaningful for service calls handled through `hass.callService`.
- Frontend actions such as `navigate`, `more-info`, `url` and similar Home Assistant actions are dispatched through Home Assistant's normal action system and cannot be awaited.
- The visual editor for `custom:custom-template-badge` covers common fields such as entity, name, label, icon, colors, layout and error handling.
- Advanced action configuration can still be edited in YAML.

## v0.3.3

### Changed
- Updated the default badge typography to better match Home Assistant's standard badge style.
- Increased the default badge height, border radius, padding, gap and icon size.
- Increased the label/state font size and weight.
- Adjusted the name font size and weight to better match the standard Home Assistant badge layout.

### Notes
- Existing custom layout options such as `height`, `padding`, `border_radius`, `gap` and `icon_size` still override the new defaults.

## v0.3.2

### Fixed
- Added `custom-badge.js` as a shared HACS entrypoint.
- Ensured both `custom:custom-js-badge` and `custom:custom-template-badge` are loaded from a single dashboard resource.
- Fixed cases where only `custom:custom-js-badge` appeared in the Home Assistant badge picker.

### Changed
- Renamed the repository/package structure from `custom-js-badge` to `custom-badge`.
- Updated the HACS display name to `Custom Badge`.
- Updated the HACS entry file from `custom-js-badge.js` to `custom-badge.js`.
- Prepared the repository structure for multiple badge types in the same package.

## v0.3.1

### Fixed

* Improved registration of `custom:custom-js-badge` in the Home Assistant badge picker.
* Prevented `window.customBadges` from being replaced during registration.
* Reduced the risk of Custom Badge interfering with other community badges such as Mushroom, Team Tracker, and other custom badge integrations.
* Fixed cases where existing Custom Badge instances worked in dashboards, but the badge did not appear when adding a new badge from the UI.

### Changed

* Custom badge picker registration now updates an existing entry in-place instead of filtering and replacing the global `window.customBadges` array.
* Added delayed re-registration to make badge picker discovery more reliable if Home Assistant or other custom badges update the shared badge registry after initial load

## [0.3.0] - 2026-07-06

### Added

- Added `custom:custom-template-badge`.
- Added Home Assistant template support using `{{ ... }}` and `{% ... %}` syntax.
- Added template support for text, icon, colors, visibility flags, layout values and error labels in `custom-template-badge`.
- Added Home Assistant template examples to the README.
- Added a combined README for both `custom:custom-js-badge` and `custom:custom-template-badge`.
- Added this changelog.

### Changed

- Documented release flow for HACS and GitHub releases.
- Recommended repository structure now includes both badge files under `dist/`.

### Notes

- For HACS update notes, copy this release entry into the GitHub release notes when publishing `v0.3.0`.
- HACS uses GitHub releases for versioning when releases exist. Tags alone are not enough.

## [0.2.2] - 2026-07-06

### Added

- Added constants for badge type, name and version in `custom-js-badge`.
- Added guarded custom element registration.
- Added duplicate prevention for the Home Assistant custom badge picker.

### Changed

- Improved reload behavior during development.

## [0.2.1] - 2026-07-06

### Added

- Added handling for missing entities.
- Added handling for `unknown` and `unavailable` entity states.
- Added `missing_entity_label`, `unknown_label`, `unavailable_label` and `template_error_label`.
- Added `hide_if_missing`, `hide_if_unknown` and `hide_if_unavailable`.
- Added HTML escaping for rendered badge text.

## [0.2.0] - 2026-07-06

### Added

- Added layout options:
  - `show_icon`
  - `show_name`
  - `show_label`
  - `height`
  - `border_radius`
  - `padding`
  - `gap`
  - `icon_size`

## [0.1.9] - 2026-07-06

### Added

- Added color options:
  - `color`
  - `icon_color`
  - `background_color`
  - `border_color`
  - `name_color`
  - `primary_color`
  - `label_color`
  - `secondary_color`

## [0.1.8] - 2026-07-06

### Added

- Added `tap_action`.
- Added `hold_action`.
- Added `double_tap_action`.
- Added default tap behavior: `more-info` when an entity is configured.

## [0.1.6] - 2026-07-06

### Added

- Added JavaScript template support using `[[[ return ... ]]]`.
- Added template variables:
  - `hass`
  - `entity`
  - `states`
  - `config`
  - `user`
  - `helpers`

## [0.1.5] - 2026-07-06

### Added

- Added formatted state display with unit fallback.
- Added battery device class fallback for `%`.

## [0.1.3] - 2026-07-06

### Changed

- Replaced question mark icon fallback with Home Assistant state icon support.
- Removed icon placeholder when no entity or icon is configured.

## [0.1.2] - 2026-07-06

### Changed

- Updated badge typography.
- Made name smaller and non-bold.
- Made label/state bold.

## [0.1.1] - 2026-07-06

### Added

- Added entity support.
- Added default entity friendly name.
- Added default entity state.
- Added default entity icon handling.

## [0.1.0] - 2026-07-06

### Added

- Initial custom badge skeleton.
- Registered `custom:custom-js-badge`.
- Added basic Home Assistant custom badge picker metadata.
