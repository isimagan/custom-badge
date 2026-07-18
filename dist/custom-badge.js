// src/entity-state.js
function getStateObject(config, hass) {
  if (!config?.entity || !hass?.states) {
    return void 0;
  }
  return hass.states[config.entity];
}
function formatEntityState(config, hass, stateObject) {
  if (!stateObject) {
    return config.entity ? "Entity not found" : "";
  }
  if (hass?.formatEntityState) {
    return hass.formatEntityState(stateObject);
  }
  const state = stateObject.state ?? "";
  const unit = stateObject.attributes?.unit_of_measurement;
  return unit ? `${state} ${unit}` : state;
}

// version.json
var version_default = {
  version: "0.6.0"
};

// src/constants.js
var CUSTOM_BADGE_TYPE = "custom-js-badge";
var CUSTOM_BADGE_NAME = "Custom Badge";
var CUSTOM_BADGE_VERSION = version_default.version;
var TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;
var DEFAULT_STYLES = Object.freeze({
  iconColor: "var(--state-icon-color)",
  backgroundColor: "var(--ha-card-background, var(--card-background-color, white))",
  primaryColor: "var(--primary-text-color)",
  secondaryColor: "var(--secondary-text-color)"
});

// src/template.js
function createTemplateHelpers(states) {
  return {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId])
  };
}
function evaluateTemplate(value, { config, hass, stateObject }) {
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
    return "Template error";
  }
}

// src/value-helpers.js
function readValue(value, context) {
  return evaluateTemplate(value, context);
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

// src/badge-styles.js
function getBadgeStyleVariables(config, context) {
  return {
    "--custom-js-badge-icon-color": readStyleValue(
      config.icon_color ?? config.color,
      DEFAULT_STYLES.iconColor,
      context
    ),
    "--custom-js-badge-background-color": readStyleValue(
      config.background_color,
      DEFAULT_STYLES.backgroundColor,
      context
    ),
    "--custom-js-badge-primary-color": readStyleValue(
      config.primary_color ?? config.label_color,
      DEFAULT_STYLES.primaryColor,
      context
    ),
    "--custom-js-badge-secondary-color": readStyleValue(
      config.secondary_color ?? config.name_color,
      DEFAULT_STYLES.secondaryColor,
      context
    )
  };
}
function applyBadgeStyles(badge, styleVariables) {
  for (const [property, value] of Object.entries(styleVariables)) {
    badge.style.setProperty(property, value);
  }
}

// src/badge-model.js
function createContext(config, hass, stateObject) {
  return { config, hass, stateObject };
}
function getPrimary(config, hass, stateObject, read) {
  const value = config.primary ?? config.label;
  if (value !== void 0) {
    return read(value);
  }
  return formatEntityState(config, hass, stateObject);
}
function getSecondary(config, stateObject, read) {
  const value = config.secondary ?? config.name ?? stateObject?.attributes?.friendly_name ?? config.entity ?? "";
  return read(value);
}
function getIcon(config, stateObject, read) {
  const value = config.icon ?? stateObject?.attributes?.icon ?? "";
  return read(value);
}
function createBadgeModel(config, hass) {
  const stateObject = getStateObject(config, hass);
  const context = createContext(config, hass, stateObject);
  const read = (value) => readValue(value, context);
  return {
    stateObject,
    primary: normalizeTextValue(
      getPrimary(config, hass, stateObject, read)
    ),
    secondary: normalizeTextValue(getSecondary(config, stateObject, read)),
    icon: normalizeTextValue(getIcon(config, stateObject, read)),
    showIcon: readBooleanValue(config.show_icon, true, context),
    showPrimary: readBooleanValue(
      config.show_primary ?? config.show_label,
      true,
      context
    ),
    showSecondary: readBooleanValue(
      config.show_secondary ?? config.show_name,
      true,
      context
    ),
    styleVariables: getBadgeStyleVariables(config, context)
  };
}

// src/styles.js
var BADGE_STYLES = `
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  .badge {
    --badge-color: var(--custom-js-badge-icon-color);
    --ha-ripple-color: var(--badge-color);
    --ha-ripple-hover-opacity: 0.04;
    --ha-ripple-pressed-opacity: 0.12;
    justify-content: center;
    align-items: center;
    gap: var(--ha-space-2);
    height: var(--ha-badge-size, 36px);
    min-width: var(--ha-badge-size, 36px);
    box-sizing: border-box;
    border-radius: var(
      --ha-badge-border-radius,
      calc(var(--ha-badge-size, 36px) / 2)
    );
    background: var(--custom-js-badge-background-color);
    width: auto;
    backdrop-filter: var(--ha-card-backdrop-filter, none);
    border-width: var(--ha-card-border-width, 1px);
    box-shadow: var(--ha-card-box-shadow, none);
    border-style: solid;
    border-color: var(
      --ha-card-border-color,
      var(--divider-color, #e0e0e0)
    );
    flex-direction: row;
    padding: 0 12px;
    transition:
      box-shadow 0.18s ease-in-out,
      border-color 0.18s ease-in-out;
    display: flex;
    position: relative;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .info {
    text-align: center;
    flex-direction: column;
    align-items: flex-start;
    padding-inline-start: initial;
    display: flex;
    min-width: 0;
  }

  .label {
    font-size: var(--ha-font-size-xs);
    font-style: normal;
    font-weight: var(--ha-font-weight-medium);
    letter-spacing: 0.1px;
    color: var(--custom-js-badge-secondary-color);
    line-height: 10px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content {
    font-size: var(--ha-badge-font-size, var(--ha-font-size-s));
    font-style: normal;
    font-weight: var(--ha-font-weight-medium);
    line-height: var(--ha-line-height-condensed);
    letter-spacing: 0.1px;
    color: var(--custom-js-badge-primary-color);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-left: -4px;
    margin-right: 0;
    margin-inline: -4px 0;
    line-height: 0;
  }

  ha-icon,
  ha-state-icon {
    --mdc-icon-size: var(--ha-badge-icon-size, 18px);
    color: var(--badge-color);
  }
`;

// src/badge-renderer.js
function createTextMarkup(model) {
  const secondaryMarkup = model.showSecondary && model.secondary ? `<span class="label">${escapeHtml(model.secondary)}</span>` : "";
  const primaryMarkup = model.showPrimary && model.primary ? `<span class="content">${escapeHtml(model.primary)}</span>` : "";
  if (!secondaryMarkup && !primaryMarkup) {
    return "";
  }
  return `<span class="info">${secondaryMarkup}${primaryMarkup}</span>`;
}
function appendIcon(iconContainer, model, hass) {
  if (model.icon) {
    const iconElement = document.createElement("ha-icon");
    iconElement.setAttribute("icon", model.icon);
    iconContainer.appendChild(iconElement);
    return;
  }
  if (model.stateObject) {
    const stateIconElement = document.createElement("ha-state-icon");
    stateIconElement.hass = hass;
    stateIconElement.stateObj = model.stateObject;
    iconContainer.appendChild(stateIconElement);
    return;
  }
  iconContainer.remove();
}
function renderBadge(shadowRoot, model, hass) {
  shadowRoot.innerHTML = `
    <style>${BADGE_STYLES}</style>
    <div class="badge">
      <span class="icon"></span>
      ${createTextMarkup(model)}
    </div>
  `;
  const badge = shadowRoot.querySelector(".badge");
  if (!badge) {
    return void 0;
  }
  applyBadgeStyles(badge, model.styleVariables);
  const iconContainer = shadowRoot.querySelector(".icon");
  if (!iconContainer) {
    return badge;
  }
  if (!model.showIcon) {
    iconContainer.remove();
    return badge;
  }
  appendIcon(iconContainer, model, hass);
  return badge;
}

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

// src/interactions.js
var HOLD_DELAY = 500;
var DOUBLE_TAP_DELAY = 250;
var BadgeInteractions = class {
  constructor(host) {
    this.host = host;
    this.hass = void 0;
    this.config = {};
    this.holdTimer = void 0;
    this.tapTimer = void 0;
    this.holdTriggered = false;
  }
  update(hass, config) {
    this.hass = hass;
    this.config = config;
  }
  bind(badge) {
    badge.addEventListener("pointerdown", () => this.onPointerDown());
    badge.addEventListener("pointerup", () => this.onPointerUp());
    badge.addEventListener("pointerleave", () => this.onPointerUp());
    badge.addEventListener("pointercancel", () => this.onPointerUp());
    badge.addEventListener("click", (event) => this.onClick(event));
    badge.addEventListener("dblclick", (event) => this.onDoubleClick(event));
  }
  run(action) {
    void runConfiguredAction(
      this.host,
      this.hass,
      this.config,
      action
    ).catch((error) => {
      console.error(`[custom-js-badge] ${action} action failed:`, error);
    });
  }
  onPointerDown() {
    clearTimeout(this.holdTimer);
    this.holdTriggered = false;
    this.holdTimer = setTimeout(() => {
      this.holdTriggered = true;
      this.run("hold");
    }, HOLD_DELAY);
  }
  onPointerUp() {
    clearTimeout(this.holdTimer);
  }
  onClick(event) {
    if (this.holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    clearTimeout(this.tapTimer);
    this.tapTimer = setTimeout(() => this.run("tap"), DOUBLE_TAP_DELAY);
  }
  onDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.tapTimer);
    this.run("double_tap");
  }
};

// src/custom-js-badge.js
var CustomJsBadge = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = void 0;
    this._interactions = new BadgeInteractions(this);
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
  _render() {
    if (!this.shadowRoot) {
      return;
    }
    const model = createBadgeModel(this._config, this._hass);
    const badge = renderBadge(this.shadowRoot, model, this._hass);
    if (!badge) {
      return;
    }
    this._interactions.update(this._hass, this._config);
    this._interactions.bind(badge);
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
