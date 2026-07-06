const CUSTOM_JS_BADGE_TYPE = "custom-js-badge";
const CUSTOM_JS_BADGE_NAME = "Custom JS Badge";
const CUSTOM_JS_BADGE_VERSION = "0.3.3";

const TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;

class CustomJsBadge extends HTMLElement {
  constructor() {
    super();
  
    this.attachShadow({ mode: "open" });
  
    this._config = {};
    this._hass = undefined;
  
    this._holdTimer = undefined;
    this._tapTimer = undefined;
    this._holdTriggered = false;
  }

  setConfig(config) {
    this._config = config ?? {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _getStateObj() {
    if (!this._config?.entity || !this._hass?.states) {
      return undefined;
    }
  
    return this._hass.states[this._config.entity];
  }

  _readValue(value) {
    if (typeof value !== "string") {
      return value;
    }
  
    const match = value.match(TEMPLATE_REGEX);
  
    if (!match) {
      return value;
    }
  
    return this._evaluateTemplate(match[1], value);
  }

  _getStyleValue(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
  
    return this._readValue(value);
  }

  _getBooleanValue(value, fallback = true) {
    if (value === undefined || value === null) {
      return fallback;
    }
  
    const evaluated = this._readValue(value);
  
    if (typeof evaluated === "boolean") {
      return evaluated;
    }
  
    if (typeof evaluated === "string") {
      return evaluated.toLowerCase() !== "false";
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

_evaluateTemplate(code, originalValue) {
  const hass = this._hass;
  const entity = this._getStateObj();
  const states = hass?.states ?? {};
  const config = this._config;
  const user = hass?.user;

  const helpers = {
    state: (entityId) => states[entityId]?.state,
    attr: (entityId, attribute) => states[entityId]?.attributes?.[attribute],
    hasEntity: (entityId) => Boolean(states[entityId]),
  };

  try {
    return Function(
      "hass",
      "entity",
      "states",
      "config",
      "user",
      "helpers",
      `"use strict";\n${code}`
    )(hass, entity, states, config, user, helpers);
  } catch (error) {
    console.error("[custom-js-badge] Template error:", error, originalValue);
  
    return this._readValue(
      this._config.template_error_label ?? "Template error"
    );
  }
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

  return this._readValue(value);
}

_formatState(stateObj) {
  if (!stateObj) {
    return this._readValue(this._config.missing_entity_label ?? "");
  }

  if (stateObj.state === "unavailable") {
    return this._readValue(
      this._config.unavailable_label ?? "Unavailable"
    );
  }

  if (stateObj.state === "unknown") {
    return this._readValue(
      this._config.unknown_label ?? "Unknown"
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
  const value =
    this._config.secondary ??
    this._config.label;

  if (value !== undefined) {
    return this._readValue(value);
  }

  return this._formatState(stateObj);
}

  _getIcon(stateObj) {
  const value =
    this._config.icon ??
    stateObj?.attributes?.icon ??
    "";

  return this._readValue(value);
}

  _render() {
    if (!this.shadowRoot) return;

    const stateObj = this._getStateObj();

    const entityConfigured = Boolean(this._config.entity);
    const entityMissing = entityConfigured && !stateObj;
    const entityUnavailable = stateObj?.state === "unavailable";
    const entityUnknown = stateObj?.state === "unknown";
    
    const hideIfMissing = this._getBooleanValue(this._config.hide_if_missing, false);
    const hideIfUnavailable = this._getBooleanValue(this._config.hide_if_unavailable, false);
    const hideIfUnknown = this._getBooleanValue(this._config.hide_if_unknown, false);
    
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
      "var(--state-icon-color)"
    );
    
    const backgroundColor = this._getStyleValue(
      this._config.background_color,
      "var(--ha-card-background, var(--card-background-color))"
    );
    
    const borderColor = this._getStyleValue(
      this._config.border_color,
      "var(--divider-color)"
    );
    
    const nameColor = this._getStyleValue(
      this._config.name_color ?? this._config.primary_color,
      "var(--secondary-text-color)"
    );
    
    const labelColor = this._getStyleValue(
      this._config.label_color ?? this._config.secondary_color,
      "var(--primary-text-color)"
    );

    const showIcon = this._getBooleanValue(this._config.show_icon, true);
    const showName = this._getBooleanValue(this._config.show_name, true);
    const showLabel = this._getBooleanValue(this._config.show_label, true);
    
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

    badge.style.setProperty("--custom-js-badge-icon-color", iconColor);
    badge.style.setProperty("--custom-js-badge-background-color", backgroundColor);
    badge.style.setProperty("--custom-js-badge-border-color", borderColor);
    badge.style.setProperty("--custom-js-badge-name-color", nameColor);
    badge.style.setProperty("--custom-js-badge-label-color", labelColor);

    badge.style.setProperty("--custom-js-badge-height", height);
    badge.style.setProperty("--custom-js-badge-border-radius", borderRadius);
    badge.style.setProperty("--custom-js-badge-padding", padding);
    badge.style.setProperty("--custom-js-badge-gap", gap);
    badge.style.setProperty("--custom-js-badge-icon-size", iconSize);

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
    };
  }
}

function registerCustomJsBadge() {
  window.customBadges = window.customBadges || [];

  const definition = {
    type: CUSTOM_JS_BADGE_TYPE,
    name: CUSTOM_JS_BADGE_NAME,
    preview: false,
    description: "A customizable badge with JavaScript template support.",
  };

  const existingIndex = window.customBadges.findIndex(
    (badge) => badge.type === CUSTOM_JS_BADGE_TYPE
  );

  if (existingIndex >= 0) {
    window.customBadges[existingIndex] = definition;
  } else {
    window.customBadges.push(definition);
  }
}

if (!customElements.get(CUSTOM_JS_BADGE_TYPE)) {
  customElements.define(CUSTOM_JS_BADGE_TYPE, CustomJsBadge);
}

registerCustomJsBadge();
setTimeout(registerCustomJsBadge, 0);
setTimeout(registerCustomJsBadge, 1000);

console.info(
  `%c${CUSTOM_JS_BADGE_NAME} ${CUSTOM_JS_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
