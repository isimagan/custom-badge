import "./custom-template-badge-editor.js";

const CUSTOM_TEMPLATE_BADGE_TYPE = "custom-template-badge";
const CUSTOM_TEMPLATE_BADGE_NAME = "Custom Template Badge";
const CUSTOM_TEMPLATE_BADGE_VERSION = "0.3.1";

const TEMPLATE_FIELDS = [
  "name",
  "primary",
  "label",
  "secondary",
  "icon",
  "color",
  "icon_color",
  "background_color",
  "border_color",
  "name_color",
  "primary_color",
  "label_color",
  "secondary_color",
  "show_icon",
  "show_name",
  "show_label",
  "height",
  "border_radius",
  "padding",
  "gap",
  "icon_size",
  "missing_entity_label",
  "unknown_label",
  "unavailable_label",
  "template_error_label",
  "hide_if_missing",
  "hide_if_unknown",
  "hide_if_unavailable",
];

class CustomTemplateBadge extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this._config = {};
    this._hass = undefined;

    this._holdTimer = undefined;
    this._tapTimer = undefined;
    this._holdTriggered = false;

    this._renderedTemplates = new Map();
    this._templateUnsubs = new Map();
    this._templateSignature = "";
    this._templateSetupScheduled = false;
  }

  static getConfigElement() {
    return document.createElement("custom-template-badge-editor");
  }

  setConfig(config) {
    this._config = config ?? {};
    this._resetTemplateSubscriptions();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._setupTemplateSubscriptionsSoon();
    this._render();
  }

  disconnectedCallback() {
    this._resetTemplateSubscriptions();
  }

  _getStateObj() {
    if (!this._config?.entity || !this._hass?.states) {
      return undefined;
    }

    return this._hass.states[this._config.entity];
  }

  _isTemplate(value) {
    return (
      typeof value === "string" &&
      (value.includes("{{") || value.includes("{%") || value.includes("{#"))
    );
  }

  _templateEntries() {
    return TEMPLATE_FIELDS
      .filter((field) => this._isTemplate(this._config[field]))
      .map((field) => [field, this._config[field]]);
  }

  _getTemplateSignature() {
    return JSON.stringify(this._templateEntries());
  }

  _resetTemplateSubscriptions() {
    for (const unsubPromiseOrFn of this._templateUnsubs.values()) {
      Promise.resolve(unsubPromiseOrFn)
        .then((unsub) => {
          if (typeof unsub === "function") {
            unsub();
          }
        })
        .catch((error) => {
          console.warn("[custom-template-badge] Could not unsubscribe template:", error);
        });
    }

    this._templateUnsubs.clear();
    this._renderedTemplates.clear();
    this._templateSignature = "";
  }

  _setupTemplateSubscriptionsSoon() {
    if (this._templateSetupScheduled) {
      return;
    }

    this._templateSetupScheduled = true;

    queueMicrotask(() => {
      this._templateSetupScheduled = false;
      this._setupTemplateSubscriptions();
    });
  }

  _setupTemplateSubscriptions() {
    if (!this._hass) {
      return;
    }

    const signature = this._getTemplateSignature();

    if (signature === this._templateSignature) {
      return;
    }

    this._resetTemplateSubscriptions();
    this._templateSignature = signature;

    for (const [field, template] of this._templateEntries()) {
      this._subscribeTemplate(field, template);
    }
  }

  _subscribeTemplate(field, template) {
    const key = this._templateKey(field, template);

    if (this._hass?.connection?.subscribeMessage) {
      const unsubPromise = this._hass.connection.subscribeMessage(
        (message) => {
          if (message?.result !== undefined && message?.result !== null) {
            this._renderedTemplates.set(key, String(message.result));
          } else {
            this._renderedTemplates.set(key, this._getTemplateErrorLabel());
          }

          this._render();
        },
        {
          type: "render_template",
          template,
        }
      );

      this._templateUnsubs.set(key, unsubPromise);
      return;
    }

    this._renderTemplateViaRest(key, template);
  }

  async _renderTemplateViaRest(key, template) {
    if (!this._hass?.callApi) {
      return;
    }

    try {
      const result = await this._hass.callApi("POST", "template", { template });
      this._renderedTemplates.set(key, String(result ?? ""));
    } catch (error) {
      console.error("[custom-template-badge] Template error:", error, template);
      this._renderedTemplates.set(key, this._getTemplateErrorLabel());
    }

    this._render();
  }

  _templateKey(field, template) {
    return `${field}::${template}`;
  }

  _getTemplateErrorLabel() {
    const value = this._config.template_error_label;

    if (typeof value === "string" && !this._isTemplate(value)) {
      return value;
    }

    return "Template error";
  }

  _readValue(value, field, fallback = "") {
    if (!this._isTemplate(value)) {
      return value;
    }

    const key = this._templateKey(field, value);

    if (this._renderedTemplates.has(key)) {
      return this._renderedTemplates.get(key);
    }

    return fallback;
  }

  _getStyleValue(value, field, fallback) {
    const evaluated = this._readValue(value, field, fallback);

    if (evaluated === undefined || evaluated === null || evaluated === "") {
      return fallback;
    }

    return evaluated;
  }

  _getBooleanValue(value, field, fallback = true) {
    if (value === undefined || value === null) {
      return fallback;
    }

    const evaluated = this._readValue(value, field, fallback);

    if (typeof evaluated === "boolean") {
      return evaluated;
    }

    if (typeof evaluated === "string") {
      const normalized = evaluated.trim().toLowerCase();
      return !["false", "0", "off", "no", "none", "null", "undefined", ""].includes(normalized);
    }

    return Boolean(evaluated);
  }

  _normalizeTextValue(value) {
    if (value === undefined || value === null || value === false) {
      return "";
    }

    return String(value);
  }

  _escapeHtml(value) {
    return this._normalizeTextValue(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _getActionConfig() {
    const hasEntity = Boolean(this._config?.entity);

    return {
      ...this._config,
      tap_action: this._config.tap_action ?? {
        action: hasEntity ? "more-info" : "none",
      },
      hold_action: this._config.hold_action ?? {
        action: "none",
      },
      double_tap_action: this._config.double_tap_action ?? {
        action: "none",
      },
    };
  }

  _fireHassAction(action) {
    const event = new Event("hass-action", {
      bubbles: true,
      composed: true,
    });

    event.detail = {
      config: this._getActionConfig(),
      action,
    };

    this.dispatchEvent(event);
  }

  _onPointerDown() {
    clearTimeout(this._holdTimer);
    this._holdTriggered = false;

    this._holdTimer = setTimeout(() => {
      this._holdTriggered = true;
      this._fireHassAction("hold");
    }, 500);
  }

  _onPointerUp() {
    clearTimeout(this._holdTimer);
  }

  _onClick(event) {
    if (this._holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    clearTimeout(this._tapTimer);

    this._tapTimer = setTimeout(() => {
      this._fireHassAction("tap");
    }, 250);
  }

  _onDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    clearTimeout(this._tapTimer);
    this._fireHassAction("double_tap");
  }

  _getPrimary(stateObj) {
    const value =
      this._config.primary ??
      this._config.name ??
      stateObj?.attributes?.friendly_name ??
      this._config.entity ??
      "";

    const field = this._config.primary !== undefined ? "primary" : "name";
    return this._readValue(value, field);
  }

  _formatState(stateObj) {
    if (!stateObj) {
      return this._readValue(
        this._config.missing_entity_label ?? "",
        "missing_entity_label"
      );
    }

    if (stateObj.state === "unavailable") {
      return this._readValue(
        this._config.unavailable_label ?? "Unavailable",
        "unavailable_label"
      );
    }

    if (stateObj.state === "unknown") {
      return this._readValue(
        this._config.unknown_label ?? "Unknown",
        "unknown_label"
      );
    }

    if (this._hass?.formatEntityState) {
      return this._hass.formatEntityState(stateObj);
    }

    const state = stateObj.state ?? "";
    const unit = stateObj.attributes?.unit_of_measurement;

    if (unit) {
      return `${state} ${unit}`;
    }

    if (stateObj.attributes?.device_class === "battery") {
      return `${state} %`;
    }

    return state;
  }

  _getSecondary(stateObj) {
    const value = this._config.secondary ?? this._config.label;

    if (value !== undefined) {
      const field = this._config.secondary !== undefined ? "secondary" : "label";
      return this._readValue(value, field);
    }

    return this._formatState(stateObj);
  }

  _getIcon(stateObj) {
    const value = this._config.icon ?? stateObj?.attributes?.icon ?? "";
    return this._readValue(value, "icon");
  }

  _render() {
    if (!this.shadowRoot) {
      return;
    }

    const stateObj = this._getStateObj();

    const entityConfigured = Boolean(this._config.entity);
    const entityMissing = entityConfigured && !stateObj;
    const entityUnavailable = stateObj?.state === "unavailable";
    const entityUnknown = stateObj?.state === "unknown";

    const hideIfMissing = this._getBooleanValue(this._config.hide_if_missing, "hide_if_missing", false);
    const hideIfUnavailable = this._getBooleanValue(this._config.hide_if_unavailable, "hide_if_unavailable", false);
    const hideIfUnknown = this._getBooleanValue(this._config.hide_if_unknown, "hide_if_unknown", false);

    if (
      (entityMissing && hideIfMissing) ||
      (entityUnavailable && hideIfUnavailable) ||
      (entityUnknown && hideIfUnknown)
    ) {
      this.shadowRoot.innerHTML = "";
      return;
    }

    const primary = this._normalizeTextValue(this._getPrimary(stateObj));
    const secondary = this._normalizeTextValue(this._getSecondary(stateObj));
    const icon = this._normalizeTextValue(this._getIcon(stateObj));

    const safePrimary = this._escapeHtml(primary);
    const safeSecondary = this._escapeHtml(secondary);

    const iconColor = this._getStyleValue(
      this._config.icon_color ?? this._config.color,
      this._config.icon_color !== undefined ? "icon_color" : "color",
      "var(--state-icon-color)"
    );

    const backgroundColor = this._getStyleValue(
      this._config.background_color,
      "background_color",
      "var(--ha-card-background, var(--card-background-color))"
    );

    const borderColor = this._getStyleValue(
      this._config.border_color,
      "border_color",
      "var(--divider-color)"
    );

    const nameColor = this._getStyleValue(
      this._config.name_color ?? this._config.primary_color,
      this._config.name_color !== undefined ? "name_color" : "primary_color",
      "var(--secondary-text-color)"
    );

    const labelColor = this._getStyleValue(
      this._config.label_color ?? this._config.secondary_color,
      this._config.label_color !== undefined ? "label_color" : "secondary_color",
      "var(--primary-text-color)"
    );

    const showIcon = this._getBooleanValue(this._config.show_icon, "show_icon", true);
    const showName = this._getBooleanValue(this._config.show_name, "show_name", true);
    const showLabel = this._getBooleanValue(this._config.show_label, "show_label", true);

    const height = this._getStyleValue(this._config.height, "52px");
    const borderRadius = this._getStyleValue(this._config.border_radius, "26px");
    const padding = this._getStyleValue(this._config.padding, "0 20px 0 16px");
    const gap = this._getStyleValue(this._config.gap, "12px");
    const iconSize = this._getStyleValue(this._config.icon_size, "28px");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        .badge {
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          gap: var(--custom-js-badge-gap);
          min-height: var(--custom-js-badge-height);
          padding: var(--custom-js-badge-padding);
          border-radius: var(--custom-js-badge-border-radius);
          background: var(--custom-js-badge-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--custom-js-badge-border-color);
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        ha-icon,
        ha-state-icon {
          --mdc-icon-size: var(--custom-js-badge-icon-size);
          color: var(--custom-js-badge-icon-color);
          flex: 0 0 auto;
        }

        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          line-height: 1.05;
        }
        
        .primary {
          color: var(--custom-js-badge-name-color);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.05;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .secondary {
          color: var(--custom-js-badge-label-color);
          font-size: 20px;
          font-weight: 700;
          line-height: 1.05;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .only-secondary {
          color: var(--custom-js-badge-label-color);
          font-size: 20px;
          font-weight: 700;
          line-height: 1.05;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <div class="badge">
        <span class="icon-container"></span>
        <div class="text">
          ${showName && primary ? `<div class="primary">${safePrimary}</div>` : ""}
          ${showLabel && secondary ? `<div class="${showName && primary ? "secondary" : "only-secondary"}">${safeSecondary}</div>` : ""}
        </div>
      </div>
    `;

    const badge = this.shadowRoot.querySelector(".badge");

    badge.style.setProperty("--custom-template-badge-icon-color", iconColor);
    badge.style.setProperty("--custom-template-badge-background-color", backgroundColor);
    badge.style.setProperty("--custom-template-badge-border-color", borderColor);
    badge.style.setProperty("--custom-template-badge-name-color", nameColor);
    badge.style.setProperty("--custom-template-badge-label-color", labelColor);
    badge.style.setProperty("--custom-template-badge-height", height);
    badge.style.setProperty("--custom-template-badge-border-radius", borderRadius);
    badge.style.setProperty("--custom-template-badge-padding", padding);
    badge.style.setProperty("--custom-template-badge-gap", gap);
    badge.style.setProperty("--custom-template-badge-icon-size", iconSize);

    badge.addEventListener("pointerdown", () => this._onPointerDown());
    badge.addEventListener("pointerup", () => this._onPointerUp());
    badge.addEventListener("pointerleave", () => this._onPointerUp());
    badge.addEventListener("pointercancel", () => this._onPointerUp());
    badge.addEventListener("click", (event) => this._onClick(event));
    badge.addEventListener("dblclick", (event) => this._onDoubleClick(event));

    const iconContainer = this.shadowRoot.querySelector(".icon-container");

    if (!showIcon) {
      iconContainer.remove();
    } else if (icon) {
      const iconEl = document.createElement("ha-icon");
      iconEl.setAttribute("icon", icon);
      iconContainer.appendChild(iconEl);
    } else if (stateObj) {
      const stateIconEl = document.createElement("ha-state-icon");
      stateIconEl.hass = this._hass;
      stateIconEl.stateObj = stateObj;
      iconContainer.appendChild(stateIconEl);
    } else {
      iconContainer.remove();
    }
  }

  static getStubConfig() {
    return {
      entity: "sun.sun",
      label: "{{ states('sun.sun') }}",
    };
  }
}

function registerCustomTemplateBadge() {
  window.customBadges = window.customBadges || [];

  const definition = {
    type: CUSTOM_TEMPLATE_BADGE_TYPE,
    name: CUSTOM_TEMPLATE_BADGE_NAME,
    preview: false,
    description: "A customizable badge with Home Assistant template support.",
  };

  const existingIndex = window.customBadges.findIndex(
    (badge) => badge.type === CUSTOM_TEMPLATE_BADGE_TYPE
  );

  if (existingIndex >= 0) {
    window.customBadges[existingIndex] = definition;
  } else {
    window.customBadges.push(definition);
  }
}

if (!customElements.get(CUSTOM_TEMPLATE_BADGE_TYPE)) {
  customElements.define(CUSTOM_TEMPLATE_BADGE_TYPE, CustomTemplateBadge);
}

if (!customElements.get("custom-template-badge-editor")) {
  customElements.define("custom-template-badge-editor", CustomTemplateBadgeEditor);
}

registerCustomTemplateBadge();
setTimeout(registerCustomTemplateBadge, 0);
setTimeout(registerCustomTemplateBadge, 1000);

console.info(
  `%c${CUSTOM_TEMPLATE_BADGE_NAME} ${CUSTOM_TEMPLATE_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);

