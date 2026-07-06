# Custom JS Badge

A custom Home Assistant dashboard badge with JavaScript template support.

This badge is intended as a flexible replacement for standard dashboard badges, with support for entity defaults, custom text, custom icons, dynamic JavaScript values, styling, and Home Assistant actions.

## Features

- Entity is optional
- Defaults to entity name, state and icon when an entity is provided
- Supports custom `name`, `label`, `primary`, `secondary` and `icon`
- Supports JavaScript templates using `[[[ return ... ]]]`
- Supports `tap_action`, `hold_action` and `double_tap_action`
- Supports custom colors and layout options
- Handles missing, unknown and unavailable entities

## Installation with HACS

Add this repository as a custom repository in HACS:

1. Go to **HACS**
2. Open the three-dot menu
3. Choose **Custom repositories**
4. Add this repository URL
5. Choose category **Dashboard**
6. Install **Custom JS Badge**

After installation, refresh your browser.

## Basic usage

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
```

By default, the badge uses:

- the entity friendly name as the name
- the formatted entity state as the label
- the entity icon as the icon

## Override name, label and icon

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    name: Bob
    label: Batteri
    icon: mdi:robot-vacuum
```

You can also use `primary` and `secondary` instead of `name` and `label`:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    primary: Bob
    secondary: Batteri
    icon: mdi:robot-vacuum
```

## JavaScript templates

JavaScript templates use the same triple-bracket style as many Home Assistant custom cards:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    name: "[[[ return 'Bob'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:battery'; ]]]"
```

Templates have access to:

| Variable | Description |
| --- | --- |
| `hass` | The Home Assistant object |
| `entity` | The configured entity state object |
| `states` | All Home Assistant states |
| `config` | The badge config |
| `user` | The current Home Assistant user |
| `helpers` | Small helper functions |

Available helpers:

```js
helpers.state("sensor.example")
helpers.attr("sensor.example", "friendly_name")
helpers.hasEntity("sensor.example")
```

## Actions

```yaml
badges:
  - type: custom:custom-js-badge
    entity: light.sofalys
    tap_action:
      action: more-info
    hold_action:
      action: toggle
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/lights
```

If no `tap_action` is defined and an entity is configured, the default tap action is `more-info`.

## Dynamic colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    name: Bob
    icon_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
    background_color: "[[[ return Number(entity.state) < 30 ? 'rgba(244, 67, 54, 0.12)' : 'rgba(76, 175, 80, 0.12)'; ]]]"
    border_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
```

## Layout options

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    name: Bob
    height: 44px
    border_radius: 22px
    padding: 0 16px
    gap: 10px
    icon_size: 24px
```

You can also hide parts of the badge:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.bob_batteri
    show_icon: false
    show_name: false
```

## Handling missing or unavailable entities

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.finnes_ikke
    name: Test
    missing_entity_label: Mangler entity
```

Hide the badge if the entity is missing:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.finnes_ikke
    hide_if_missing: true
```

Hide the badge if the entity is unavailable:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.example
    hide_if_unavailable: true
```

## Development

Main file:

```text
dist/custom-js-badge.js
```

When testing through HACS:

1. Commit changes to GitHub
2. Redownload the repository in HACS
3. Hard refresh Home Assistant
4. Check the browser console for the current version

The console should show something like:

```text
Custom JS Badge 0.2.2
```
