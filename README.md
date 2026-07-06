# Custom Badge

Custom Badge is a custom Home Assistant dashboard badge package.

It contains two badge types:

```yaml
type: custom:custom-js-badge
```

and:

```yaml
type: custom:custom-template-badge
```

The goal is to provide flexible badge alternatives for Home Assistant dashboards, with support for entity defaults, custom text, custom icons, actions, styling, layout options, JavaScript templates, and Home Assistant templates.

## Badges

| Badge | Description |
| --- | --- |
| `custom:custom-js-badge` | Badge with JavaScript template support using `[[[ return ... ]]]`. |
| `custom:custom-template-badge` | Badge with Home Assistant template support using `{{ ... }}` and visual editing in the UI. |

## Features

### Shared features

Both badges support:

- Optional entity
- Entity name, formatted state and entity icon as defaults
- Custom `name`, `label`, `primary`, `secondary` and `icon`
- `tap_action`, `hold_action` and `double_tap_action`
- Custom icon color, background color, border color and text colors
- Layout options such as height, padding, radius, gap and icon size
- Hiding icon, name or label
- Handling missing, `unknown` and `unavailable` entities
- Hiding the badge when an entity is missing, unknown or unavailable

### JavaScript badge features

`custom:custom-js-badge` supports:

- JavaScript templates using `[[[ return ... ]]]`
- `multi-actions`
- Sequential action execution
- Delay steps in multi-actions
- Service calls through `perform-action`, `call-service` and `call_service`

### Template badge features

`custom:custom-template-badge` supports:

- Home Assistant templates using `{{ ... }}`
- Visual editing in the Home Assistant UI
- A separate editor module: `custom-template-badge-editor.js`

## Installation

### HACS custom repository

Until this repository is published in HACS, add it as a custom repository.

1. Open **HACS**
2. Open the three-dot menu
3. Select **Custom repositories**
4. Add this repository URL
5. Choose category **Dashboard**
6. Install **Custom Badge**
7. Refresh Home Assistant in your browser

### HACS entrypoint

The main HACS entrypoint is:

```text
dist/custom-badge.js
```

`custom-badge.js` imports both badge files:

```js
import "./custom-js-badge.js";
import "./custom-template-badge.js";
```

The template badge imports its visual editor:

```js
import "./custom-template-badge-editor.js";
```

## File structure

Recommended repository structure:

```text
custom-badge/
├─ README.md
├─ CHANGELOG.md
├─ hacs.json
└─ dist/
   ├─ custom-badge.js
   ├─ custom-js-badge.js
   ├─ custom-template-badge.js
   └─ custom-template-badge-editor.js
```

Example `hacs.json`:

```json
{
  "name": "Custom Badge",
  "content_in_root": false,
  "filename": "custom-badge.js"
}
```

## Basic usage

### JavaScript badge

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
```

### Template badge

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
```

By default, both badges use:

- the entity friendly name as the name
- the formatted entity state as the label
- the entity icon as the icon

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

The same works for the template badge:

```yaml
badges:
  - type: custom:custom-template-badge
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

```yaml
badges:
  - type: custom:custom-template-badge
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

`custom:custom-js-badge` supports JavaScript templates using triple brackets:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

Example:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: "[[[ return 'Robot vacuum'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:robot-vacuum'; ]]]"
```

Templates must return a value.

### Available JavaScript template variables

| Variable | Description |
| --- | --- |
| `hass` | The full Home Assistant object |
| `entity` | The configured entity state object |
| `states` | All Home Assistant states |
| `config` | The badge configuration |
| `user` | The current Home Assistant user |
| `helpers` | Helper functions |

### JavaScript helper functions

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

## Home Assistant templates

`custom:custom-template-badge` supports Home Assistant templates using `{{ ... }}`.

Example:

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: "{{ states('sensor.robotvacuum_battery') }} %"
    icon: mdi:robot-vacuum
```

You can also use templates in colors and text fields:

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: "{{ states('sensor.robotvacuum_battery') }} %"
    color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        var(--error-color)
      {% else %}
        var(--success-color)
      {% endif %}
```

## Visual editor

`custom:custom-template-badge` supports visual editing in the Home Assistant UI.

The visual editor supports common options such as:

- Entity
- Name
- Label / template
- Icon
- Colors
- Layout
- Error handling

Advanced options, including complex actions, can still be edited in YAML.

The visual editor is provided by:

```text
dist/custom-template-badge-editor.js
```

## Actions

Both badges support:

- `tap_action`
- `hold_action`
- `double_tap_action`

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

## Multi-actions

`custom:custom-js-badge` supports running multiple actions sequentially from `tap_action`, `hold_action` or `double_tap_action`.

Use:

```yaml
action: multi-actions
```

or:

```yaml
action: multi-action
```

Example:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    tap_action:
      action: multi-actions
      actions:
        - action: perform-action
          perform_action: script.robot_start_cleanup

        - delay: 500

        - action: navigate
          navigation_path: /lovelace/robot-vacuum
```

You can also use `sequence` instead of `actions`:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    tap_action:
      action: multi-actions
      sequence:
        - action: perform-action
          perform_action: script.robot_start_cleanup

        - delay: 1s

        - action: more-info
```

Supported delay formats:

```yaml
- delay: 500
- delay: 500ms
- delay: 1s
```

Supported service action formats:

```yaml
- action: perform-action
  perform_action: light.turn_on
  target:
    entity_id: light.living_room
```

```yaml
- action: call-service
  service: light.turn_on
  target:
    entity_id: light.living_room
```

```yaml
- action: call_service
  service: light.turn_on
  target:
    entity_id: light.living_room
```

You can pass service data:

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

        - action: more-info
```

`wait_completion` is only meaningful for service calls handled through `hass.callService`.

Frontend actions such as `navigate`, `more-info`, `url` and similar Home Assistant actions are dispatched through Home Assistant's normal action system and cannot be awaited.

## Colors

Both badges support static colors and template-based colors.

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

### Dynamic JavaScript colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
    background_color: "[[[ return Number(entity.state) < 30 ? 'rgba(244, 67, 54, 0.12)' : 'rgba(76, 175, 80, 0.12)'; ]]]"
    border_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
```

### Dynamic Home Assistant template colors

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        var(--error-color)
      {% else %}
        var(--success-color)
      {% endif %}
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
    height: 52px
    border_radius: 26px
    padding: 0 20px 0 16px
    gap: 12px
    icon_size: 28px
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

If a JavaScript template fails, the JavaScript badge shows `Template error` by default.

You can override this:

```yaml
badges:
  - type: custom:custom-js-badge
    name: "[[[ return doesNotExist.value; ]]]"
    label: Test
    template_error_label: JavaScript error
```

## Full JavaScript badge example

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

    height: 52px
    border_radius: 26px
    padding: 0 20px 0 16px
    gap: 12px
    icon_size: 28px

    tap_action:
      action: multi-actions
      actions:
        - action: perform-action
          perform_action: script.robot_start_cleanup

        - delay: 500ms

        - action: navigate
          navigation_path: /lovelace/robot-vacuum

    hold_action:
      action: more-info

    double_tap_action:
      action: none

    unavailable_label: Unavailable
    unknown_label: Unknown
    missing_entity_label: Missing entity
    template_error_label: Template error

    hide_if_missing: false
    hide_if_unknown: false
    hide_if_unavailable: false
```

## Full template badge example

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery

    name: Robot vacuum
    label: "{{ states('sensor.robotvacuum_battery') }} %"
    icon: mdi:robot-vacuum

    icon_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        var(--error-color)
      {% else %}
        var(--success-color)
      {% endif %}

    background_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        rgba(244, 67, 54, 0.12)
      {% else %}
        rgba(76, 175, 80, 0.12)
      {% endif %}

    border_color: var(--divider-color)

    height: 52px
    border_radius: 26px
    padding: 0 20px 0 16px
    gap: 12px
    icon_size: 28px

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | string | optional | Home Assistant entity ID. If provided, the badge can use the entity name, state and icon. |
| `name` | string/template | entity friendly name | Text shown as the smaller name line. Alias for `primary`. |
| `primary` | string/template | entity friendly name | Same as `name`. |
| `label` | string/template | formatted entity state | Text shown as the bold label/state line. Alias for `secondary`. |
| `secondary` | string/template | formatted entity state | Same as `label`. |
| `icon` | string/template | entity icon | Icon to show. If omitted and `entity` exists, Home Assistant's entity icon is used. |
| `color` | string/template | `var(--state-icon-color)` | Alias for `icon_color`. |
| `icon_color` | string/template | `var(--state-icon-color)` | Icon color. |
| `background_color` | string/template | `var(--ha-card-background, var(--card-background-color))` | Badge background color. |
| `border_color` | string/template | `var(--divider-color)` | Badge border color. |
| `name_color` | string/template | `var(--secondary-text-color)` | Color for the smaller name line. |
| `primary_color` | string/template | `var(--secondary-text-color)` | Alias for `name_color`. |
| `label_color` | string/template | `var(--primary-text-color)` | Color for the bold label line. |
| `secondary_color` | string/template | `var(--primary-text-color)` | Alias for `label_color`. |
| `show_icon` | boolean/template | `true` | Show or hide the icon. |
| `show_name` | boolean/template | `true` | Show or hide the name line. |
| `show_label` | boolean/template | `true` | Show or hide the label line. |
| `height` | string/template | `52px` | Minimum badge height. |
| `border_radius` | string/template | `26px` | Badge border radius. |
| `padding` | string/template | `0 20px 0 16px` | Badge padding. |
| `gap` | string/template | `12px` | Gap between icon and text. |
| `icon_size` | string/template | `28px` | Icon size. |
| `tap_action` | action object | `more-info` if entity exists, otherwise `none` | Action when tapping the badge. |
| `hold_action` | action object | `none` | Action when holding the badge. |
| `double_tap_action` | action object | `none` | Action when double tapping the badge. |
| `missing_entity_label` | string/template | empty | Label shown when `entity` is configured but does not exist. |
| `unknown_label` | string/template | `Unknown` | Label shown when entity state is `unknown`. |
| `unavailable_label` | string/template | `Unavailable` | Label shown when entity state is `unavailable`. |
| `template_error_label` | string/template | `Template error` | Text shown when a template fails. |
| `hide_if_missing` | boolean/template | `false` | Hide the badge if the configured entity does not exist. |
| `hide_if_unknown` | boolean/template | `false` | Hide the badge if the entity state is `unknown`. |
| `hide_if_unavailable` | boolean/template | `false` | Hide the badge if the entity state is `unavailable`. |

## Security note

JavaScript templates are executed in the browser using the configuration you provide.

Only use JavaScript templates that you trust. Do not paste JavaScript from unknown sources unless you understand what it does.

## Development

Main HACS entrypoint:

```text
dist/custom-badge.js
```

Badge files:

```text
dist/custom-js-badge.js
dist/custom-template-badge.js
```

Editor file:

```text
dist/custom-template-badge-editor.js
```

Recommended workflow when testing through HACS:

```text
Commit to GitHub
→ Create GitHub Release
→ HACS: Update information
→ Install/update
→ Hard refresh Home Assistant
→ Check browser console version
```

If Home Assistant still shows an old version:

1. Check that the new code is committed to `dist/`
2. Check that the GitHub Release points to the correct commit
3. Update information in HACS
4. Update or redownload the integration in HACS
5. Hard refresh the browser
6. Open the `/hacsfiles/` resource directly and search for the current version number

## Troubleshooting

### Custom element doesn't exist

This usually means the JavaScript file failed to load or crashed before registering the custom element.

Check the browser console for errors such as:

```text
Uncaught SyntaxError
```

or:

```text
Custom element already defined
```

### Only one badge appears in the badge picker

Make sure Home Assistant loads the shared entrypoint:

```text
dist/custom-badge.js
```

The entrypoint should import both badge files:

```js
import "./custom-js-badge.js";
import "./custom-template-badge.js";
```

### My changes do not show up

Make sure you have:

1. Committed the change to GitHub
2. Created or updated the GitHub Release
3. Updated information in HACS
4. Updated or redownloaded the repository in HACS
5. Hard refreshed the browser
6. Confirmed the new version in the browser console

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

`{{ ... }}` is for `custom:custom-template-badge`.

### Template does not render

Make sure you are using the template badge:

```yaml
type: custom:custom-template-badge
```

not:

```yaml
type: custom:custom-js-badge
```

## Roadmap

Planned ideas:

- More visual editor fields
- Better action editor support
- More styling options
- More examples
- HACS publication

## License

MIT- Can hide itself when an entity is missing, unknown or unavailable
- Includes one badge for JavaScript templates and one badge for Home Assistant templates

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
Custom JS Badge 0.3.0
Custom Template Badge 0.3.0
```

### Manual development installation

For local testing, you can place the files here:

```text
/config/www/custom-js-badge/custom-js-badge.js
/config/www/custom-js-badge/custom-template-badge.js
```

Then add them as dashboard resources:

```text
/local/custom-js-badge/custom-js-badge.js
/local/custom-js-badge/custom-template-badge.js
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
├─ CHANGELOG.md
├─ hacs.json
└─ dist/
   ├─ custom-js-badge.js
   └─ custom-template-badge.js
```

Example `hacs.json`:

```json
{
  "name": "Custom JS Badge",
  "content_in_root": false,
  "filename": "custom-js-badge.js"
}
```

For HACS dashboard plugins, the repository must contain JavaScript files in `dist/` or in the repository root. At least one JavaScript file should match the repository name. If HACS finds matching files in `dist/`, it downloads the JavaScript files from there.

## Basic usage

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
```

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
```

By default, the badge uses:

- the entity friendly name as the name
- the formatted entity state as the label
- the entity icon as the icon

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

```yaml
badges:
  - type: custom:custom-template-badge
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

```yaml
badges:
  - type: custom:custom-template-badge
    name: Manual badge
    label: "{{ now().strftime('%H:%M') }}"
    icon: mdi:clock-outline
```

If no entity and no icon are provided, the badge is shown without an icon.

## JavaScript templates

JavaScript templates are supported by `custom:custom-js-badge`.

They use triple brackets:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

Full example:

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: "[[[ return 'Robot vacuum'; ]]]"
    label: "[[[ return `${entity.state} %`; ]]]"
    icon: "[[[ return Number(entity.state) < 30 ? 'mdi:battery-alert' : 'mdi:robot-vacuum'; ]]]"
```

Templates must return a value.

### Available JavaScript variables

| Variable | Description |
| --- | --- |
| `hass` | The full Home Assistant object |
| `entity` | The configured entity state object |
| `states` | All Home Assistant states |
| `config` | The badge configuration |
| `user` | The current Home Assistant user |
| `helpers` | Helper functions |

### JavaScript helper functions

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

## Home Assistant templates

Home Assistant templates are supported by `custom:custom-template-badge`.

They use normal Home Assistant template syntax:

```yaml
label: "{{ states('sensor.robotvacuum_battery') }} %"
```

Full example:

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    label: "{{ states('sensor.robotvacuum_battery') }} %"
    icon: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        mdi:battery-alert
      {% else %}
        mdi:robot-vacuum
      {% endif %}
```

Another compact example:

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: "{{ state_attr('sensor.robotvacuum_battery', 'friendly_name') or 'Robot vacuum' }}"
    label: "{{ states('sensor.robotvacuum_battery') }} %"
```

Template rendering is handled by Home Assistant. The badge subscribes to rendered template updates when possible.

## Actions

Both badges support:

- `tap_action`
- `hold_action`
- `double_tap_action`

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
  - type: custom:custom-template-badge
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
  - type: custom:custom-template-badge
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

Both badges support static colors and templates.

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

### Dynamic JavaScript colors

```yaml
badges:
  - type: custom:custom-js-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
    background_color: "[[[ return Number(entity.state) < 30 ? 'rgba(244, 67, 54, 0.12)' : 'rgba(76, 175, 80, 0.12)'; ]]]"
    border_color: "[[[ return Number(entity.state) < 30 ? 'var(--error-color)' : 'var(--success-color)'; ]]]"
```

### Dynamic Home Assistant template colors

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery
    name: Robot vacuum
    icon_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        var(--error-color)
      {% else %}
        var(--success-color)
      {% endif %}
    background_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        rgba(244, 67, 54, 0.12)
      {% else %}
        rgba(76, 175, 80, 0.12)
      {% endif %}
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
  - type: custom:custom-template-badge
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
  - type: custom:custom-template-badge
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
  - type: custom:custom-template-badge
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

```yaml
badges:
  - type: custom:custom-template-badge
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
  - type: custom:custom-template-badge
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
  - type: custom:custom-template-badge
    entity: sensor.example
    hide_if_unavailable: true
```

### JavaScript template error

If a JavaScript template fails, `custom:custom-js-badge` shows `Template error` by default.

```yaml
badges:
  - type: custom:custom-js-badge
    name: "[[[ return doesNotExist.value; ]]]"
    label: Test
    template_error_label: JavaScript error
```

### Home Assistant template error

If a Home Assistant template fails, `custom:custom-template-badge` shows `Template error` by default.

```yaml
badges:
  - type: custom:custom-template-badge
    name: "{{ broken_template_value }}"
    label: Test
    template_error_label: Template error
```

## Full JavaScript badge example

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

## Full Home Assistant template badge example

```yaml
badges:
  - type: custom:custom-template-badge
    entity: sensor.robotvacuum_battery

    name: Robot vacuum
    label: "{{ states('sensor.robotvacuum_battery') }} %"
    icon: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        mdi:battery-alert
      {% else %}
        mdi:robot-vacuum
      {% endif %}

    icon_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        var(--error-color)
      {% else %}
        var(--success-color)
      {% endif %}
    background_color: >
      {% if states('sensor.robotvacuum_battery') | int(0) < 30 %}
        rgba(244, 67, 54, 0.12)
      {% else %}
        rgba(76, 175, 80, 0.12)
      {% endif %}
    border_color: var(--divider-color)

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `entity` | string | optional | Home Assistant entity ID. If provided, the badge can use the entity name, state and icon. |
| `name` | string/template | entity friendly name | Text shown as the smaller name line. Alias for `primary`. |
| `primary` | string/template | entity friendly name | Same as `name`. |
| `label` | string/template | formatted entity state | Text shown as the bold label/state line. Alias for `secondary`. |
| `secondary` | string/template | formatted entity state | Same as `label`. |
| `icon` | string/template | entity icon | Icon to show. If omitted and `entity` exists, Home Assistant's entity icon is used. |
| `color` | string/template | `var(--state-icon-color)` | Alias for `icon_color`. |
| `icon_color` | string/template | `var(--state-icon-color)` | Icon color. |
| `background_color` | string/template | `var(--ha-card-background, var(--card-background-color))` | Badge background color. |
| `border_color` | string/template | `var(--divider-color)` | Badge border color. |
| `name_color` | string/template | `var(--secondary-text-color)` | Color for the smaller name line. |
| `primary_color` | string/template | `var(--secondary-text-color)` | Alias for `name_color`. |
| `label_color` | string/template | `var(--primary-text-color)` | Color for the bold label line. |
| `secondary_color` | string/template | `var(--primary-text-color)` | Alias for `label_color`. |
| `show_icon` | boolean/template | `true` | Show or hide the icon. |
| `show_name` | boolean/template | `true` | Show or hide the name line. |
| `show_label` | boolean/template | `true` | Show or hide the label line. |
| `height` | string/template | `36px` | Minimum badge height. |
| `border_radius` | string/template | `18px` | Badge border radius. |
| `padding` | string/template | `0 12px 0 10px` | Badge padding. |
| `gap` | string/template | `8px` | Gap between icon and text. |
| `icon_size` | string/template | `20px` | Icon size. |
| `tap_action` | action object | `more-info` if entity exists, otherwise `none` | Action when tapping the badge. |
| `hold_action` | action object | `none` | Action when holding the badge. |
| `double_tap_action` | action object | `none` | Action when double tapping the badge. |
| `missing_entity_label` | string/template | empty | Label shown when `entity` is configured but does not exist. |
| `unknown_label` | string/template | `Unknown` | Label shown when entity state is `unknown`. |
| `unavailable_label` | string/template | `Unavailable` | Label shown when entity state is `unavailable`. |
| `template_error_label` | string/template | `Template error` | Text shown when a template fails. |
| `hide_if_missing` | boolean/template | `false` | Hide the badge if the configured entity does not exist. |
| `hide_if_unknown` | boolean/template | `false` | Hide the badge if the entity state is `unknown`. |
| `hide_if_unavailable` | boolean/template | `false` | Hide the badge if the entity state is `unavailable`. |

For `custom:custom-js-badge`, `template` means JavaScript inside `[[[ ... ]]]`.

For `custom:custom-template-badge`, `template` means Home Assistant template syntax using `{{ ... }}` or `{% ... %}`.

## Changelog and releases

Keep human-readable changes in `CHANGELOG.md`.

For HACS update notes, also publish GitHub releases and copy the relevant changelog entry into the GitHub release notes. HACS uses GitHub releases for versioning when releases exist; tags alone are not enough.

Recommended release flow:

```text
1. Update version constants in the JavaScript files
2. Update CHANGELOG.md
3. Commit changes
4. Create a GitHub release, for example v0.3.0
5. Paste the v0.3.0 changelog into the release notes
6. HACS will detect the new version
```

## Security note

JavaScript templates are executed in the browser using the configuration you provide.

Home Assistant templates are rendered by Home Assistant.

Only use templates that you trust. Do not paste template code from unknown sources unless you understand what it does.

## Development

Main files:

```text
dist/custom-js-badge.js
dist/custom-template-badge.js
```

Recommended workflow when testing through HACS:

```text
Commit to GitHub
→ HACS: Redownload
→ Hard refresh Home Assistant
→ Check browser console version
```

If Home Assistant still shows an old version:

1. Check that the new code is committed to `dist/`
2. Redownload the repository in HACS
3. Hard refresh the browser
4. Open `/hacsfiles/custom-js-badge/custom-js-badge.js`
5. Search for the current version number

## Troubleshooting

### Custom element doesn't exist

If Home Assistant says:

```text
Custom element doesn't exist: custom-js-badge
```

or:

```text
Custom element doesn't exist: custom-template-badge
```

then the JavaScript file likely failed to load or crashed before registering the custom element.

Check the browser console for errors such as:

```text
Uncaught SyntaxError
```

or:

```text
Custom element already defined
```

### My changes do not show up

Make sure you have:

1. Committed the change to GitHub
2. Redownloaded the repository in HACS
3. Hard refreshed the browser
4. Confirmed the new version in the browser console

### Entity icon does not show

If `icon` is not configured, the badges use Home Assistant's state icon when an entity exists.

You can always override it manually:

```yaml
icon: mdi:robot-vacuum
```

### JavaScript shows as text

Make sure you are using `custom:custom-js-badge` and triple brackets:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

Not:

```yaml
name: "{{ 'Robot vacuum' }}"
```

### Home Assistant template shows as text

Make sure you are using `custom:custom-template-badge` and normal Home Assistant template syntax:

```yaml
name: "{{ 'Robot vacuum' }}"
```

Not:

```yaml
name: "[[[ return 'Robot vacuum'; ]]]"
```

## Roadmap

Planned:

- More examples
- More styling options
- HACS publication
- Releases and changelog improvements
- Shared base source to reduce duplicated code between the two badges

## License

MIT
