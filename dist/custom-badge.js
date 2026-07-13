// src/constants.js
var CUSTOM_BADGE_TYPE = "custom-js-badge";
var CUSTOM_BADGE_NAME = "Custom Badge";
var CUSTOM_BADGE_VERSION = "0.5.0";
var TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;
var DEFAULT_STYLES = Object.freeze({
  iconColor: "var(--state-icon-color)",
  backgroundColor: "var(--ha-card-background, var(--card-background-color))",
  borderColor: "var(--divider-color)",
  nameColor: "var(--secondary-text-color)",
  labelColor: "var(--primary-text-color)",
  height: "48px",
  borderRadius: "24px",
  padding: "0 16px 0 14px",
  gap: "10px",
  iconSize: "24px"
});

// src/actions.js
var ACTION_PROPERTY = Object.freeze({
  tap: "tap_action",
  hold: "hold_action",
  double_tap: "double_tap_action"
});
function defaultAction(action, hasEntity) {
  if (action === "tap") {
    return { action: hasEntity ? "more-info" : "none" };
  }
  return { action: "none" };
}
function getActionConfig(config = {}) {
  const hasEntity = Boolean(config.entity);
  return {
    ...config,
    tap_action: config.tap_action ?? defaultAction("tap", hasEntity),
    hold_action: config.hold_action ?? defaultAction("hold", hasEntity),
    double_tap_action: config.double_tap_action ?? defaultAction("double_tap", hasEntity)
  };
}
function fireHassAction(host, config, action) {
  const event = new Event("hass-action", {
    bubbles: true,
    composed: true
  });
  event.detail = { config, action };
  host.dispatchEvent(event);
}
function parseDelay(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }
  if (typeof value !== "string") {
    return 0;
  }
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(ms|s)?$/);
  if (!match) {
    return 0;
  }
  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1e3 : amount;
}
function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function getServiceName(actionConfig) {
  return actionConfig.perform_action ?? actionConfig.service;
}
function isServiceAction(actionConfig) {
  return ["perform-action", "call-service", "call_service"].includes(
    actionConfig?.action
  );
}
async function runServiceAction(hass, actionConfig) {
  const serviceName = getServiceName(actionConfig);
  if (!serviceName || !hass?.callService) {
    console.warn("[custom-js-badge] Invalid service action:", actionConfig);
    return;
  }
  const separator = serviceName.indexOf(".");
  if (separator < 1 || separator === serviceName.length - 1) {
    console.warn("[custom-js-badge] Invalid service name:", serviceName);
    return;
  }
  const domain = serviceName.slice(0, separator);
  const service = serviceName.slice(separator + 1);
  const data = actionConfig.data ?? actionConfig.service_data ?? {};
  const target = actionConfig.target;
  await hass.callService(domain, service, data, target);
}
function isMultiAction(actionConfig) {
  return ["multi-action", "multi-actions"].includes(actionConfig?.action);
}
async function runActionStep(host, hass, baseConfig, actionConfig) {
  if (!actionConfig || actionConfig.action === "none") {
    return;
  }
  if (Object.hasOwn(actionConfig, "delay")) {
    await delay(parseDelay(actionConfig.delay));
    return;
  }
  if (isMultiAction(actionConfig)) {
    await runMultiAction(host, hass, baseConfig, actionConfig);
    return;
  }
  if (isServiceAction(actionConfig)) {
    await runServiceAction(hass, actionConfig);
    return;
  }
  fireHassAction(
    host,
    {
      ...baseConfig,
      tap_action: actionConfig
    },
    "tap"
  );
}
async function runMultiAction(host, hass, baseConfig, actionConfig) {
  const sequence = actionConfig.actions ?? actionConfig.sequence ?? [];
  if (!Array.isArray(sequence)) {
    console.warn("[custom-js-badge] Multi-action sequence must be an array.");
    return;
  }
  for (const step of sequence) {
    await runActionStep(host, hass, baseConfig, step);
  }
}
async function runConfiguredAction(host, hass, config, action) {
  const actionProperty = ACTION_PROPERTY[action];
  if (!actionProperty) {
    return;
  }
  const actionConfig = getActionConfig(config);
  const configuredAction = actionConfig[actionProperty];
  if (isMultiAction(configuredAction)) {
    await runMultiAction(host, hass, actionConfig, configuredAction);
    return;
  }
  fireHassAction(host, actionConfig, action);
}

// src/styles.js
var BADGE_STYLES = `
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
    font-size: 13px;
    font-weight: 500;
    line-height: 1.05;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .secondary,
  .only-secondary {
    color: var(--custom-js-badge-label-color);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.05;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// src/value-helpers.js
function getStateObject(config, hass) {
  if (!config?.entity || !hass?.states) {
    return void 0;
  }
  return hass.states[config.entity];
}
function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId])
  };
}
function readValue(value, { config, hass, stateObject }) {
  if (typeof value !== "string") {
    return value;
  }
  const match = value.match(TEMPLATE_REGEX);
  if (!match) {
    return value;
  }
  const states = hass?.states ?? {};
  const helpers = createTemplateHelpers(states);
  try {
    return Function(
      "hass",
      "entity",
      "states",
      "config",
      "user",
      "helpers",
      `"use strict";
${match[1]}`
    )(hass, stateObject, states, config, hass?.user, helpers);
  } catch (error) {
    console.error("[custom-js-badge] Template error:", error, value);
    return config?.template_error_label ?? "Template error";
  }
}
function readStyleValue(value, fallback, context) {
  if (value === void 0 || value === null || value === "") {
    return fallback;
  }
  return readValue(value, context);
}
function readBooleanValue(value, fallback, context) {
  if (value === void 0 || value === null) {
    return fallback;
  }
  const evaluated = readValue(value, context);
  if (typeof evaluated === "boolean") {
    return evaluated;
  }
  if (typeof evaluated === "string") {
    return evaluated.toLowerCase() !== "false";
  }
  return Boolean(evaluated);
}
function normalizeTextValue(value) {
  if (value === void 0 || value === null || value === false) {
    return "";
  }
  return String(value);
}
function escapeHtml(value) {
  return normalizeTextValue(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

// src/custom-js-badge.js
var CustomJsBadge = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = void 0;
    this._holdTimer = void 0;
    this._tapTimer = void 0;
    this._holdTriggered = false;
  }
  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Custom Badge requires a configuration object.");
    }
    this._config = config;
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  _getStateObject() {
    return getStateObject(this._config, this._hass);
  }
  _getValueContext(stateObject = this._getStateObject()) {
    return {
      config: this._config,
      hass: this._hass,
      stateObject
    };
  }
  _readValue(value, stateObject) {
    return readValue(value, this._getValueContext(stateObject));
  }
  _readStyleValue(value, fallback, stateObject) {
    return readStyleValue(
      value,
      fallback,
      this._getValueContext(stateObject)
    );
  }
  _readBooleanValue(value, fallback, stateObject) {
    return readBooleanValue(
      value,
      fallback,
      this._getValueContext(stateObject)
    );
  }
  _onPointerDown() {
    clearTimeout(this._holdTimer);
    this._holdTriggered = false;
    this._holdTimer = setTimeout(() => {
      this._holdTriggered = true;
      void runConfiguredAction(
        this,
        this._hass,
        this._config,
        "hold"
      ).catch((error) => {
        console.error("[custom-js-badge] Hold action failed:", error);
      });
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
      void runConfiguredAction(
        this,
        this._hass,
        this._config,
        "tap"
      ).catch((error) => {
        console.error("[custom-js-badge] Tap action failed:", error);
      });
    }, 250);
  }
  _onDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this._tapTimer);
    void runConfiguredAction(
      this,
      this._hass,
      this._config,
      "double_tap"
    ).catch((error) => {
      console.error("[custom-js-badge] Double-tap action failed:", error);
    });
  }
  _getPrimary(stateObject) {
    const value = this._config.primary ?? this._config.name ?? stateObject?.attributes?.friendly_name ?? this._config.entity ?? "";
    return this._readValue(value, stateObject);
  }
  _formatState(stateObject) {
    if (!stateObject) {
      return this._readValue(
        this._config.missing_entity_label ?? "",
        stateObject
      );
    }
    if (stateObject.state === "unavailable") {
      return this._readValue(
        this._config.unavailable_label ?? "Unavailable",
        stateObject
      );
    }
    if (stateObject.state === "unknown") {
      return this._readValue(
        this._config.unknown_label ?? "Unknown",
        stateObject
      );
    }
    if (this._hass?.formatEntityState) {
      return this._hass.formatEntityState(stateObject);
    }
    const state = stateObject.state ?? "";
    const unit = stateObject.attributes?.unit_of_measurement;
    if (unit) {
      return `${state} ${unit}`;
    }
    if (stateObject.attributes?.device_class === "battery") {
      return `${state} %`;
    }
    return state;
  }
  _getSecondary(stateObject) {
    const value = this._config.secondary ?? this._config.label;
    if (value !== void 0) {
      return this._readValue(value, stateObject);
    }
    return this._formatState(stateObject);
  }
  _getIcon(stateObject) {
    const value = this._config.icon ?? stateObject?.attributes?.icon ?? "";
    return this._readValue(value, stateObject);
  }
  _setBadgeStyles(badge, values) {
    for (const [property, value] of Object.entries(values)) {
      badge.style.setProperty(property, value);
    }
  }
  _appendIcon(iconContainer, icon, stateObject) {
    if (icon) {
      const iconElement = document.createElement("ha-icon");
      iconElement.setAttribute("icon", icon);
      iconContainer.appendChild(iconElement);
      return;
    }
    if (stateObject) {
      const stateIconElement = document.createElement("ha-state-icon");
      stateIconElement.hass = this._hass;
      stateIconElement.stateObj = stateObject;
      iconContainer.appendChild(stateIconElement);
      return;
    }
    iconContainer.remove();
  }
  _render() {
    if (!this.shadowRoot) {
      return;
    }
    const stateObject = this._getStateObject();
    const entityConfigured = Boolean(this._config.entity);
    const entityMissing = entityConfigured && !stateObject;
    const entityUnavailable = stateObject?.state === "unavailable";
    const entityUnknown = stateObject?.state === "unknown";
    const hideIfMissing = this._readBooleanValue(
      this._config.hide_if_missing,
      false,
      stateObject
    );
    const hideIfUnavailable = this._readBooleanValue(
      this._config.hide_if_unavailable,
      false,
      stateObject
    );
    const hideIfUnknown = this._readBooleanValue(
      this._config.hide_if_unknown,
      false,
      stateObject
    );
    if (entityMissing && hideIfMissing || entityUnavailable && hideIfUnavailable || entityUnknown && hideIfUnknown) {
      this.shadowRoot.innerHTML = "";
      return;
    }
    const primary = normalizeTextValue(this._getPrimary(stateObject));
    const secondary = normalizeTextValue(this._getSecondary(stateObject));
    const icon = normalizeTextValue(this._getIcon(stateObject));
    const showIcon = this._readBooleanValue(
      this._config.show_icon,
      true,
      stateObject
    );
    const showName = this._readBooleanValue(
      this._config.show_name,
      true,
      stateObject
    );
    const showLabel = this._readBooleanValue(
      this._config.show_label,
      true,
      stateObject
    );
    this.shadowRoot.innerHTML = `
      <style>${BADGE_STYLES}</style>
      <div class="badge">
        <span class="icon-container"></span>
        <div class="text">
          ${showName && primary ? `<div class="primary">${escapeHtml(primary)}</div>` : ""}
          ${showLabel && secondary ? `<div class="${showName && primary ? "secondary" : "only-secondary"}">${escapeHtml(secondary)}</div>` : ""}
        </div>
      </div>
    `;
    const badge = this.shadowRoot.querySelector(".badge");
    if (!badge) {
      return;
    }
    this._setBadgeStyles(badge, {
      "--custom-js-badge-icon-color": this._readStyleValue(
        this._config.icon_color ?? this._config.color,
        DEFAULT_STYLES.iconColor,
        stateObject
      ),
      "--custom-js-badge-background-color": this._readStyleValue(
        this._config.background_color,
        DEFAULT_STYLES.backgroundColor,
        stateObject
      ),
      "--custom-js-badge-border-color": this._readStyleValue(
        this._config.border_color,
        DEFAULT_STYLES.borderColor,
        stateObject
      ),
      "--custom-js-badge-name-color": this._readStyleValue(
        this._config.name_color ?? this._config.primary_color,
        DEFAULT_STYLES.nameColor,
        stateObject
      ),
      "--custom-js-badge-label-color": this._readStyleValue(
        this._config.label_color ?? this._config.secondary_color,
        DEFAULT_STYLES.labelColor,
        stateObject
      ),
      "--custom-js-badge-height": this._readStyleValue(
        this._config.height,
        DEFAULT_STYLES.height,
        stateObject
      ),
      "--custom-js-badge-border-radius": this._readStyleValue(
        this._config.border_radius,
        DEFAULT_STYLES.borderRadius,
        stateObject
      ),
      "--custom-js-badge-padding": this._readStyleValue(
        this._config.padding,
        DEFAULT_STYLES.padding,
        stateObject
      ),
      "--custom-js-badge-gap": this._readStyleValue(
        this._config.gap,
        DEFAULT_STYLES.gap,
        stateObject
      ),
      "--custom-js-badge-icon-size": this._readStyleValue(
        this._config.icon_size,
        DEFAULT_STYLES.iconSize,
        stateObject
      )
    });
    badge.addEventListener("pointerdown", () => this._onPointerDown());
    badge.addEventListener("pointerup", () => this._onPointerUp());
    badge.addEventListener("pointerleave", () => this._onPointerUp());
    badge.addEventListener("pointercancel", () => this._onPointerUp());
    badge.addEventListener("click", (event) => this._onClick(event));
    badge.addEventListener("dblclick", (event) => this._onDoubleClick(event));
    const iconContainer = this.shadowRoot.querySelector(".icon-container");
    if (!iconContainer) {
      return;
    }
    if (!showIcon) {
      iconContainer.remove();
      return;
    }
    this._appendIcon(iconContainer, icon, stateObject);
  }
  static getStubConfig() {
    return {
      entity: "sun.sun"
    };
  }
};

// src/register.js
function registerCustomBadge() {
  window.customBadges = window.customBadges || [];
  const definition = {
    type: CUSTOM_BADGE_TYPE,
    name: CUSTOM_BADGE_NAME,
    preview: false,
    description: "A customizable badge with JavaScript template support."
  };
  const existingIndex = window.customBadges.findIndex(
    (badge) => badge.type === CUSTOM_BADGE_TYPE
  );
  if (existingIndex >= 0) {
    window.customBadges[existingIndex] = definition;
  } else {
    window.customBadges.push(definition);
  }
}

// src/index.js
if (!customElements.get(CUSTOM_BADGE_TYPE)) {
  customElements.define(CUSTOM_BADGE_TYPE, CustomJsBadge);
}
registerCustomBadge();
setTimeout(registerCustomBadge, 0);
setTimeout(registerCustomBadge, 1e3);
console.info(
  `%c${CUSTOM_BADGE_NAME} ${CUSTOM_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
