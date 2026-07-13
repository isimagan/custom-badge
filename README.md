# Custom Badge

Custom Badge is a customizable Home Assistant dashboard badge with JavaScript template support.

```yaml
type: custom:custom-js-badge
```

The project contains one badge type. Source code is split into modules under `src/`, while HACS installs the generated bundle from `dist/custom-badge.js`.

The source is organized by responsibility: badge state/model, visibility, styling, rendering, interactions, actions and template evaluation.

## Project structure

```text
src/
├── actions.js
├── badge-model.js
├── badge-renderer.js
├── badge-styles.js
├── badge-visibility.js
├── constants.js
├── custom-js-badge.js
├── entity-state.js
├── index.js
├── interactions.js
├── register.js
├── styles.js
├── template.js
└── value-helpers.js
```

`src/custom-js-badge.js` only handles the custom element lifecycle and coordinates the other modules.


## Features

- Optional Home Assistant entity
- Entity name, formatted state and entity icon as defaults
- Custom name, label, icon, colors and layout
- JavaScript templates using `[[[ return ... ]]]`
- Tap, hold and double-tap actions
- Sequential multi-actions and delays
- Service calls using `perform-action`, `call-service` or `call_service`
- Handling for missing, `unknown` and `unavailable` entities
- Optional hiding when an entity is missing, unknown or unavailable

## Installation with HACS

Until the repository is published in the default HACS store:

1. Open HACS.
2. Open the three-dot menu.
3. Select **Custom repositories**.
4. Add this repository URL.
5. Select **Dashboard** as the category.
6. Install **Custom Badge**.
7. Refresh Home Assistant in the browser.

HACS installs this file:

```text
dist/custom-badge.js
```

## Basic usage

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
```

By default, the badge uses the entity's:

- friendly name as the name
- formatted state as the label
- state icon as the icon

## Custom text and icon

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: Battery
    icon: mdi:robot-vacuum
```

`primary` and `secondary` can be used as aliases:

```text
name = primary
label = secondary
color = icon_color
```

## Usage without an entity

```yaml
badges:
  - type: custom:custom-js-badge
    name: Manual badge
    label: Works without an entity
    icon: mdi:test-tube
```

## JavaScript templates

Templates use triple brackets and must return a value.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: "[[[ return 'Robot vacuum'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:robot-vacuum'; ]]]"
```

### Template variables

| Variable | Description |
| --- | --- |
| `hass` | Full Home Assistant object |
| `entity` | Configured entity state object |
| `states` | All Home Assistant states |
| `config` | Badge configuration |
| `user` | Current Home Assistant user |
| `helpers` | Helper functions |

### Helpers

```js
helpers.state("sensor.example")
helpers.attr("sensor.example", "friendly_name")
helpers.hasEntity("sensor.example")
```

## Actions

If an entity is configured and `tap_action` is omitted, tapping opens more info.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: light.living_room
    name: Living room
    tap_action:
      action: more-info
    hold_action:
      action: toggle
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/lights
```

## Multi-actions

Use `multi-actions` or `multi-action` and provide `actions` or `sequence`.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: light.living_room
    name: Living room
    tap_action:
      action: multi-actions
      actions:
        - action: perform-action
          perform_action: light.turn_on
          target:
            entity_id: light.living_room
          data:
            brightness_pct: 50

        - delay: 500ms

        - action: navigate
          navigation_path: /lovelace/lights
```

Supported delay formats:

```yaml
- delay: 500
- delay: 500ms
- delay: 1s
```

## Colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    icon_color: orange
    background_color: rgba(255, 165, 0, 0.12)
    border_color: orange
    name_color: var(--secondary-text-color)
    label_color: var(--primary-text-color)
```

Colors can also use JavaScript templates.

## Layout

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    height: 52px
    border_radius: 26px
    padding: 0 20px 0 16px
    gap: 12px
    icon_size: 28px
```

Parts of the badge can be hidden:

```yaml
show_icon: false
show_name: false
show_label: false
```

## Entity and template errors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.example
    missing_entity_label: Missing entity
    unknown_label: Unknown
    unavailable_label: Unavailable
    template_error_label: Template error
    hide_if_missing: false
    hide_if_unknown: false
    hide_if_unavailable: false
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `entity` | optional | Home Assistant entity ID |
| `name` / `primary` | entity friendly name | Smaller name line |
| `label` / `secondary` | formatted entity state | Bold label/state line |
| `icon` | entity icon | Material Design icon |
| `color` / `icon_color` | state icon color | Icon color |
| `background_color` | card background | Badge background |
| `border_color` | divider color | Border color |
| `name_color` / `primary_color` | secondary text color | Name color |
| `label_color` / `secondary_color` | primary text color | Label color |
| `show_icon` | `true` | Show icon |
| `show_name` | `true` | Show name |
| `show_label` | `true` | Show label |
| `height` | `48px` | Minimum height |
| `border_radius` | `24px` | Border radius |
| `padding` | `0 16px 0 14px` | Padding |
| `gap` | `10px` | Icon/text gap |
| `icon_size` | `24px` | Icon size |
| `tap_action` | `more-info` with entity | Tap action |
| `hold_action` | `none` | Hold action |
| `double_tap_action` | `none` | Double-tap action |
| `missing_entity_label` | empty | Missing entity label |
| `unknown_label` | `Unknown` | Unknown state label |
| `unavailable_label` | `Unavailable` | Unavailable state label |
| `template_error_label` | `Template error` | Template error text |
| `hide_if_missing` | `false` | Hide when missing |
| `hide_if_unknown` | `false` | Hide when unknown |
| `hide_if_unavailable` | `false` | Hide when unavailable |

## Development

Install dependencies:

```bash
npm install
```

Build the HACS bundle:

```bash
npm run build
```

Watch source files while developing:

```bash
npm run watch
```

Repository structure:

```text
custom-badge/
├── src/
│   ├── actions.js
│   ├── constants.js
│   ├── custom-js-badge.js
│   ├── index.js
│   ├── register.js
│   ├── styles.js
│   └── value-helpers.js
├── dist/
│   └── custom-badge.js
├── CHANGELOG.md
├── README.md
├── hacs.json
├── package.json
└── package-lock.json
```

`src/` is the editable source. Commit the generated `dist/custom-badge.js` so HACS can install it.

## Security

JavaScript templates run in the browser. Only use templates you trust and understand.

## License

MIT
