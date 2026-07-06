const CUSTOM_JS_BADGE_VERSION = "0.1.9";

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
    this._config = config;
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
    return "template error";
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
    return "";
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

    const primary = this._getPrimary(stateObj);
    const secondary = this._getSecondary(stateObj);
    const icon = this._getIcon(stateObj);

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

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
    
        .badge {
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 0 12px 0 10px;
          border-radius: 18px;
          background: var(--custom-js-badge-background-color);
          color: var(--primary-text-color);
          border: 1px solid var(--custom-js-badge-border-color);
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
    
        ha-icon,
        ha-state-icon {
          --mdc-icon-size: 20px;
          color: var(--custom-js-badge-icon-color);
          flex: 0 0 auto;
        }
    
        .text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          line-height: 1.1;
        }
    
        .primary {
          color: var(--custom-js-badge-name-color);
          font-size: 11px;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
    
        .secondary {
          color: var(--custom-js-badge-label-color);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
    
        .only-secondary {
          color: var(--custom-js-badge-label-color);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
    
      <div class="badge">
        <span class="icon-container"></span>
        <div class="text">
          ${primary ? `<div class="primary">${primary}</div>` : ""}
          ${secondary ? `<div class="${primary ? "secondary" : "only-secondary"}">${secondary}</div>` : ""}
        </div>
      </div>
    `;

    const badge = this.shadowRoot.querySelector(".badge");

    badge.style.setProperty("--custom-js-badge-icon-color", iconColor);
    badge.style.setProperty("--custom-js-badge-background-color", backgroundColor);
    badge.style.setProperty("--custom-js-badge-border-color", borderColor);
    badge.style.setProperty("--custom-js-badge-name-color", nameColor);
    badge.style.setProperty("--custom-js-badge-label-color", labelColor);

    badge.addEventListener("pointerdown", () => this._onPointerDown());
    badge.addEventListener("pointerup", () => this._onPointerUp());
    badge.addEventListener("pointerleave", () => this._onPointerUp());
    badge.addEventListener("pointercancel", () => this._onPointerUp());
    badge.addEventListener("click", (event) => this._onClick(event));
    badge.addEventListener("dblclick", (event) => this._onDoubleClick(event));
    
    const iconContainer = this.shadowRoot.querySelector(".icon-container");
    
    if (icon) {
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

customElements.define("custom-js-badge", CustomJsBadge);

window.customBadges = window.customBadges || [];
window.customBadges.push({
  type: "custom-js-badge",
  name: "Custom JS Badge",
  preview: false,
  description: "A customizable badge with JavaScript template support.",
});

console.info(
  `%cCUSTOM-JS-BADGE ${CUSTOM_JS_BADGE_VERSION}`,
  "color: var(--primary-color); font-weight: bold;"
);
