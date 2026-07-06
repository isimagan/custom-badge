const CUSTOM_JS_BADGE_VERSION = "0.1.6";

const TEMPLATE_REGEX = /^\s*\[\[\[\s*([\s\S]*?)\s*\]\]\]\s*$/;

class CustomJsBadge extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this._config = {};
    this._hass = undefined;
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
          background: var(--ha-card-background, var(--card-background-color));
          color: var(--primary-text-color);
          border: 1px solid var(--divider-color);
          cursor: pointer;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
    
        ha-icon,
        ha-state-icon {
          --mdc-icon-size: 20px;
          color: var(--state-icon-color);
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
          color: var(--secondary-text-color);
          font-size: 11px;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
    
        .secondary {
          color: var(--primary-text-color);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
    
        .only-secondary {
          color: var(--primary-text-color);
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
