# Custom JS Badge

Custom JS Badge is a custom Home Assistant dashboard badge with JavaScript template support.

It is intended as a flexible replacement for standard dashboard badges and other custom badge solutions, with support for entity defaults, custom text, custom icons, dynamic JavaScript values, styling, layout options, and Home Assistant actions.

> This repository will eventually contain two badges:
>
> * `custom:custom-js-badge` — JavaScript template badge
> * `custom:custom-template-badge` — YAML/Home Assistant template badge, planned

The current working badge is:

```yaml
type: custom:custom-js-badge
```

## Features

* Entity is optional
* Uses entity name, formatted state and icon by default
* Supports custom `name`, `label`, `primary`, `secondary` and `icon`
* Supports JavaScript templates using `[[[ return ... ]]]`
* Supports `tap_action`, `hold_action` and `double_tap_action`
* Supports custom icon color, background color, border color and text colors
* Supports layout options such as height, padding, radius, gap and icon size
* Can hide icon, name or label
* Can handle missing, `unknown` and `unavailable` entities
* Can hide itself when an entity is missing, unknown or unavailable

## Installation

### HACS custom repository

Until this repository is published in HACS, add it as a custom repository.

1. Open **HACS**
2. Open the three-dot menu
3. Select **Custom repositories**
4. Add this repository URL
5. Choose category **Dashboard**
6. Install **Custom JS Badge**
7. Refresh Home Assistant in your browser

After updating the code while developing:

1. Commit changes to GitHub
2. Redownload the repository in HACS
3. Hard refresh Home Assistant
4. Check the browser console for the current version

The browser console should show something like:

```text
Custom JS Badge 0.2.2
```

### Manual development installation

For local testing, you can place the file here:

```text
/config/www/custom-js-badge/custom-js-badge.js
```

Then add this as a dashboard resource:

```text
/local/custom-js-badge/custom-js-badge.js
```

Resource type:

```text
JavaScript module
```

## File structure

Recommended repository structure:

```text
custom-js-badge/
├─ README.md
├─ hacs.json
└─ dist/
   ├─ custom-js-badge.js
   └─ custom-template-badge.js
```

Current required files:

```text
README.md
hacs.json
dist/custom-js-badge.js
```

Example `hacs.json`:

```json
{
  "name": "Custom JS Badge",
  "content_in_root": false,
  "filename": "custom-js-badge.js"
}
```

## Basic usage

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
```

By default, the badge uses:

* the entity friendly name as the name
* the formatted entity state as the label
* the entity icon as the icon

For example, a battery sensor may show:

```text
Robot Vacuum Battery
83 %
```

## Override name, label and icon

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: Battery
    icon: mdi:robot-vacuum
```

You can also use `primary` and `secondary` instead of `name` and `label`:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    primary: Robot vacuum
    secondary: Battery
    icon: mdi:robot-vacuum
```

Aliases:

```text
name    = primary
label   = secondary
color   = icon_color
```

## Usage without an entity

The entity is optional.

```yaml
badges:
  - type: custom:custom-js-badge
    name: Manual badge
    label: Works without entity
    icon: mdi:test-tube
```

If no entity and no icon are provided, the badge is shown without an icon.

```yaml
badges:
  - type: custom:custom-js-badge
    name: Manual badge
    label: No icon
```

## JavaScript templates

JavaScript templates use triple brackets:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

A full example:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: "[[[ return 'Robot vacuum'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:battery'; ]]]"
```

Templates must return a value.

### Available template variables

| Variable  | Description                        |
| --------- | ---------------------------------- |
| `hass`    | The full Home Assistant object     |
| `entity`  | The configured entity state object |
| `states`  | All Home Assistant states          |
| `config`  | The badge configuration            |
| `user`    | The current Home Assistant user    |
| `helpers` | Helper functions                   |

### Helper functions

```js
helpers.state("sensor.example")
helpers.attr("sensor.example", "friendly_name")
helpers.hasEntity("sensor.example")
```

Example:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: "[[[ return `${helpers.state('sensor.robotvacuum_battery')} %`; ]]]"
```

## Actions

The badge supports:

* `tap_action`
* `hold_action`
* `double_tap_action`

If no `tap_action` is defined and an entity is configured, the default tap action is `more-info`.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
```

This is equivalent to:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    tap_action:
      action: more-info
```

### More info

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    tap_action:
      action: more-info
```

### Toggle

```yaml
badges:
  - type: custom:custom-js-badge
    entity: light.living_room
    name: Living room
    tap_action:
      action: more-info
    hold_action:
      action: toggle
```

### Navigate

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    tap_action:
      action: navigate
      navigation_path: /lovelace/robot-vacuum
```

### Double tap

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    tap_action:
      action: more-info
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/robot-vacuum
```

## Colors

The badge supports static colors and JavaScript templates.

### Static colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: orange
    background_color: rgba(255, 165, 0, 0.12)
    border_color: orange
```

### Dynamic colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
    background_color: "[[[ return Number(entity.state) < 30 ? 'rgba(244, 67, 54, 0.12)' : 'rgba(76, 175, 80, 0.12)'; ]]]"
    border_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
```

### Text colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    name_color: var(--secondary-text-color)
    label_color: var(--primary-text-color)
```

## Layout options

You can customize the badge size and spacing.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    height: 44px
    border_radius: 22px
    padding: 0 16px
    gap: 10px
    icon_size: 24px
```

You can hide parts of the badge.

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    show_icon: false
```

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    show_name: false
```

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    show_label: false
```

A compact state-only badge:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    show_icon: false
    show_name: false
```

## Error handling

### Missing entity

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.does_not_exist
    name: Test
    missing_entity_label: Missing entity
```

### Hide if missing

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.does_not_exist
    hide_if_missing: true
```

### Unknown state

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.example
    unknown_label: Unknown
```

### Unavailable state

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.example
    unavailable_label: Unavailable
```

### Hide if unavailable

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.example
    hide_if_unavailable: true
```

### Template error

If a JavaScript template fails, the badge shows `Template error` by default.

You can override this:

```yaml
badges:
  - type: custom:custom-js-badge
    name: "[[[ return doesNotExist.value; ]]]"
    label: Test
    template_error_label: JavaScript error
```

## Full example

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery

    name: "[[[ return 'Robot vacuum'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:robot-vacuum'; ]]]"

    icon_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
    background_color: "[[[ return Number(entity.state) < 30 ? 'rgba(244, 67, 54, 0.12)' : 'rgba(76, 175, 80, 0.12)'; ]]]"
    border_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--divider-color)'; ]]]"

    height: 40px
    border_radius: 20px
    padding: 0 14px 0 12px
    gap: 8px
    icon_size: 22px

    tap_action:
      action: more-info
    hold_action:
      action: none
    double_tap_action:
      action: navigate
      navigation_path: /lovelace/robot-vacuum

    unavailable_label: Unavailable
    unknown_label: Unknown
    missing_entity_label: Missing entity
    template_error_label: Template error

    hide_if_missing: false
    hide_if_unknown: false
    hide_if_unavailable: false
```

## Options

| Option                 | Type             | Default                                                   | Description                                                                               |
| ---------------------- | ---------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `entity`               | string           | optional                                                  | Home Assistant entity ID. If provided, the badge can use the entity name, state and icon. |
| `name`                 | string/template  | entity friendly name                                      | Text shown as the smaller name line. Alias for `primary`.                                 |
| `primary`              | string/template  | entity friendly name                                      | Same as `name`.                                                                           |
| `label`                | string/template  | formatted entity state                                    | Text shown as the bold label/state line. Alias for `secondary`.                           |
| `secondary`            | string/template  | formatted entity state                                    | Same as `label`.                                                                          |
| `icon`                 | string/template  | entity icon                                               | Icon to show. If omitted and `entity` exists, Home Assistant's entity icon is used.       |
| `color`                | string/template  | `var(--state-icon-color)`                                 | Alias for `icon_color`.                                                                   |
| `icon_color`           | string/template  | `var(--state-icon-color)`                                 | Icon color.                                                                               |
| `background_color`     | string/template  | `var(--ha-card-background, var(--card-background-color))` | Badge background color.                                                                   |
| `border_color`         | string/template  | `var(--divider-color)`                                    | Badge border color.                                                                       |
| `name_color`           | string/template  | `var(--secondary-text-color)`                             | Color for the smaller name line.                                                          |
| `primary_color`        | string/template  | `var(--secondary-text-color)`                             | Alias for `name_color`.                                                                   |
| `label_color`          | string/template  | `var(--primary-text-color)`                               | Color for the bold label line.                                                            |
| `secondary_color`      | string/template  | `var(--primary-text-color)`                               | Alias for `label_color`.                                                                  |
| `show_icon`            | boolean/template | `true`                                                    | Show or hide the icon.                                                                    |
| `show_name`            | boolean/template | `true`                                                    | Show or hide the name line.                                                               |
| `show_label`           | boolean/template | `true`                                                    | Show or hide the label line.                                                              |
| `height`               | string/template  | `36px`                                                    | Minimum badge height.                                                                     |
| `border_radius`        | string/template  | `18px`                                                    | Badge border radius.                                                                      |
| `padding`              | string/template  | `0 12px 0 10px`                                           | Badge padding.                                                                            |
| `gap`                  | string/template  | `8px`                                                     | Gap between icon and text.                                                                |
| `icon_size`            | string/template  | `20px`                                                    | Icon size.                                                                                |
| `tap_action`           | action object    | `more-info` if entity exists, otherwise `none`            | Action when tapping the badge.                                                            |
| `hold_action`          | action object    | `none`                                                    | Action when holding the badge.                                                            |
| `double_tap_action`    | action object    | `none`                                                    | Action when double tapping the badge.                                                     |
| `missing_entity_label` | string/template  | empty                                                     | Label shown when `entity` is configured but does not exist.                               |
| `unknown_label`        | string/template  | `Unknown`                                                 | Label shown when entity state is `unknown`.                                               |
| `unavailable_label`    | string/template  | `Unavailable`                                             | Label shown when entity state is `unavailable`.                                           |
| `template_error_label` | string/template  | `Template error`                                          | Text shown when a JavaScript template fails.                                              |
| `hide_if_missing`      | boolean/template | `false`                                                   | Hide the badge if the configured entity does not exist.                                   |
| `hide_if_unknown`      | boolean/template | `false`                                                   | Hide the badge if the entity state is `unknown`.                                          |
| `hide_if_unavailable`  | boolean/template | `false`                                                   | Hide the badge if the entity state is `unavailable`.                                      |

## Security note

JavaScript templates are executed in the browser using the configuration you provide.

Only use templates that you trust. Do not paste JavaScript from unknown sources unless you understand what it does.

## Development

Main file:

```text
dist/custom-js-badge.js
```

Recommended workflow when testing through HACS:

```text
Commit to GitHub
→ HACS: Redownload
→ Hard refresh Home Assistant
→ Check browser console version
```

If Home Assistant still shows an old version:

1. Check that the new code is committed to `dist/custom-js-badge.js`
2. Redownload the repository in HACS
3. Hard refresh the browser
4. Open `/hacsfiles/custom-js-badge/custom-js-badge.js`
5. Search for the current version number

## Troubleshooting

### Custom element doesn't exist: custom-js-badge

This usually means the JavaScript file failed to load or crashed before registering the custom element.

Check the browser console for errors such as:

```text
Uncaught SyntaxError
```

or:

```text
Custom element already defined
```

Also check that the file contains:

```js
customElements.define("custom-js-badge", CustomJsBadge);
```

or the guarded equivalent.

### My changes do not show up

Make sure you have:

1. Committed the change to GitHub
2. Redownloaded the repository in HACS
3. Hard refreshed the browser
4. Confirmed the new version in the browser console

### Entity icon does not show

If `icon` is not configured, the badge uses Home Assistant's state icon when an entity exists.

You can always override it manually:

```yaml
icon: mdi:robot-vacuum
```

### JavaScript shows as text

Make sure the value uses triple brackets:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

Not:

```yaml
name: "{{ return 'Robot vacuum'; }}"
```

And make sure the option supports templates.

## Roadmap

Planned:

* `custom:custom-template-badge`
* YAML/Home Assistant template support
* More styling options
* More examples
* HACS publication
* Releases and changelog

## License

MIT
