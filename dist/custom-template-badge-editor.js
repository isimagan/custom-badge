const CUSTOM_TEMPLATE_BADGE_EDITOR_TYPE = "custom-template-badge-editor";
const CUSTOM_TEMPLATE_BADGE_EDITOR_VERSION = "0.4.0";

class CustomTemplateBadgeEditor extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this._config = {};
    this._hass = undefined;
  }

  setConfig(config) {
    this._config = config ?? {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    return [
      {
        type: "grid",
        name: "",
        flatten: true,
        schema: [
          {
            name: "entity",
            selector: {
              entity: {},
            },
          },
          {
            name: "icon",
            selector: {
              icon: {},
            },
            context: {
              icon_entity: "entity",
            },
          },
        ],
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        schema: [
          {
            name: "name",
            selector: {
              text: {},
            },
          },
          {
            name: "label",
            selector: {
              text: {
                multiline: true,
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "colors",
        title: "Colors",
        flatten: true,
        schema: [
          {
            name: "color",
            selector: {
              text: {},
            },
          },
          {
            name: "background_color",
            selector: {
              text: {},
            },
          },
          {
            name: "border_color",
            selector: {
              text: {},
            },
          },
          {
            name: "name_color",
            selector: {
              text: {},
            },
          },
          {
            name: "label_color",
            selector: {
              text: {},
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "layout",
        title: "Layout",
        flatten: true,
        schema: [
          {
            name: "show_icon",
            selector: {
              boolean: {},
            },
          },
          {
            name: "show_name",
            selector: {
              boolean: {},
            },
          },
          {
            name: "show_label",
            selector: {
              boolean: {},
            },
          },
          {
            name: "height",
            selector: {
              text: {},
            },
          },
          {
            name: "border_radius",
            selector: {
              text: {},
            },
          },
          {
            name: "padding",
            selector: {
              text: {},
            },
          },
          {
            name: "gap",
            selector: {
              text: {},
            },
          },
          {
            name: "icon_size",
            selector: {
              text: {},
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "error_handling",
        title: "Error handling",
        flatten: true,
        schema: [
          {
            name: "missing_entity_label",
            selector: {
              text: {},
            },
          },
          {
            name: "unknown_label",
            selector: {
              text: {},
            },
          },
          {
            name: "unavailable_label",
            selector: {
              text: {},
            },
          },
          {
            name: "template_error_label",
            selector: {
              text: {},
            },
          },
          {
            name: "hide_if_missing",
            selector: {
              boolean: {},
            },
          },
          {
            name: "hide_if_unknown",
            selector: {
              boolean: {},
            },
          },
          {
            name: "hide_if_unavailable",
            selector: {
              boolean: {},
            },
          },
        ],
      },
    ];
  }

  _computeLabel(schema) {
    const labels = {
      entity: "Entity",
      name: "Name",
      label: "Label / template",
      icon: "Icon",
      color: "Icon color",
      background_color: "Background color",
      border_color: "Border color",
      name_color: "Name color",
      label_color: "Label color",
      show_icon: "Show icon",
      show_name: "Show name",
      show_label: "Show label",
      height: "Height",
      border_radius: "Border radius",
      padding: "Padding",
      gap: "Gap",
      icon_size: "Icon size",
      missing_entity_label: "Missing entity label",
      unknown_label: "Unknown label",
      unavailable_label: "Unavailable label",
      template_error_label: "Template error label",
      hide_if_missing: "Hide if missing",
      hide_if_unknown: "Hide if unknown",
      hide_if_unavailable: "Hide if unavailable",
    };

    return labels[schema.name];
  }

  _computeHelper(schema) {
    const helpers = {
      label: "Supports Home Assistant templates, for example: {{ states('sensor.example') }}",
      color: "CSS color, theme variable or template.",
      background_color: "CSS color, theme variable or template.",
      border_color: "CSS color, theme variable or template.",
      height: "Example: 52px",
      border_radius: "Example: 26px",
      padding: "Example: 0 20px 0 16px",
      gap: "Example: 12px",
      icon_size: "Example: 28px",
    };

    return helpers[schema.name];
  }

  _valueChanged(event) {
    event.stopPropagation();

    this._config = {
      ...event.detail.value,
    };

    const configChangedEvent = new Event("config-changed", {
      bubbles: true,
      composed: true,
    });

    configChangedEvent.detail = {
      config: this._config,
    };

    this.dispatchEvent(configChangedEvent);
  }

  _render() {
    if (!this.shadowRoot || !this._hass) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <ha-form></ha-form>
    `;

    const form = this.shadowRoot.querySelector("ha-form");

    form.hass = this._hass;
    form.data = this._config;
    form.schema = this._schema();
    form.computeLabel = (schema) => this._computeLabel(schema);
    form.computeHelper = (schema) => this._computeHelper(schema);

    form.addEventListener("value-changed", (event) => this._valueChanged(event));
  }
}

if (!customElements.get(CUSTOM_TEMPLATE_BADGE_EDITOR_TYPE)) {
  customElements.define(CUSTOM_TEMPLATE_BADGE_EDITOR_TYPE, CustomTemplateBadgeEditor);
}

console.info(
  `%cCustom Template Badge Editor ${CUSTOM_TEMPLATE_BADGE_EDITOR_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
